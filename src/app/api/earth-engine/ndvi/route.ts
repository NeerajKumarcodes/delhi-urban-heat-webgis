import { NextResponse } from "next/server";
import ee from "@google/earthengine";
import { createEarthEngineMap } from "@/lib/earthEngineRest";

const credentials = require("../../../../../earth-engine-key.json");

export async function GET() {
  try {
    await new Promise<void>((resolve, reject) => {
      ee.data.authenticateViaPrivateKey(
        credentials,
        () => {
          ee.initialize(
            null,
            null,
            () => resolve(),
            (error) => reject(error)
          );
        },
        (error) => reject(error)
      );
    });

    const admin = (ee.FeatureCollection as any)(
      "FAO/GAUL/2015/level1"
    );

    const delhi = admin.filter(
      (ee.Filter as any).and(
        (ee.Filter as any).eq(
          "ADM0_NAME",
          "India"
        ),
        (ee.Filter as any).eq(
          "ADM1_NAME",
          "Delhi"
        )
      )
    );

    const sentinel2 = (ee.ImageCollection as any)(
      "COPERNICUS/S2_SR_HARMONIZED"
    )
      .filterBounds(delhi)
      .filterDate(
        "2025-01-01",
        "2026-01-01"
      )
      .filter(
        (ee.Filter as any).lt(
          "CLOUDY_PIXEL_PERCENTAGE",
          20
        )
      );

    function maskS2Clouds(image: any) {
      const qa = image.select("QA60");

      const cloudBitMask = 1 << 10;
      const cirrusBitMask = 1 << 11;

      const mask = qa
        .bitwiseAnd(cloudBitMask)
        .eq(0)
        .and(
          qa.bitwiseAnd(cirrusBitMask).eq(0)
        );

      return image
        .updateMask(mask)
        .divide(10000)
        .copyProperties(
          image,
          ["system:time_start"]
        );
    }

    const sentinel2Clean =
      sentinel2.map(maskS2Clouds);

    const sentinelComposite =
      sentinel2Clean
        .median()
        .clip(delhi);

    const ndvi = sentinelComposite
      .normalizedDifference(["B8", "B4"])
      .rename("NDVI");

    const expression = JSON.parse(
    ndvi.serialize()
    );

    const map = await createEarthEngineMap(
    expression,
    {
        min: -0.2,
        max: 0.8,
        paletteColors: [
        "0000FF",
        "FFFFFF",
        "FFFF00",
        "008000",
        "006400",
        ],
    }
    );

    return NextResponse.json({
    success: true,
    message:
        "Delhi NDVI map creation successful",
    map,
    });
  } catch (error) {
    console.error(
      "Delhi NDVI serialization error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Delhi NDVI serialization failed",
      },
      { status: 500 }
    );
  }
}