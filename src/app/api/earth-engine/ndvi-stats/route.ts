import { NextResponse } from "next/server";
import ee from "@google/earthengine";
import {
  getEarthEngineCredentials,
} from "@/lib/earthEngineRest";

const credentials =
  getEarthEngineCredentials();
  
export async function GET() {
  try {
    // Authenticate with Google Earth Engine
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

    // Delhi boundary
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

    // Sentinel-2 collection
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

    // Cloud masking
    function maskS2Clouds(image: any) {
      const qa = image.select("QA60");

      const cloudBitMask = 1 << 10;
      const cirrusBitMask = 1 << 11;

      const mask = qa
        .bitwiseAnd(cloudBitMask)
        .eq(0)
        .and(
          qa
            .bitwiseAnd(cirrusBitMask)
            .eq(0)
        );

      return image
        .updateMask(mask)
        .divide(10000)
        .copyProperties(
          image,
          ["system:time_start"]
        );
    }

    // Create median composite
    const sentinel2Clean =
      sentinel2.map(maskS2Clouds);

    const sentinelComposite =
      sentinel2Clean
        .median()
        .clip(delhi);

    // Calculate NDVI
    const ndvi = sentinelComposite
      .normalizedDifference([
        "B8",
        "B4",
      ])
      .rename("NDVI");

    // Calculate statistics
    const statistics = ndvi.reduceRegion({
      reducer: (ee.Reducer as any)
        .mean()
        .combine({
          reducer2: (ee.Reducer as any)
            .minMax(),
          sharedInputs: true,
        }),
      geometry: delhi.geometry(),
      scale: 10,
      maxPixels: 1e10,
    });

    // Evaluate the server-side result
    const result = await new Promise<any>(
      (resolve, reject) => {
        statistics.evaluate(
          (value: any, error: any) => {
            if (error) {
              reject(error);
              return;
            }

            resolve(value);
          }
        );
      }
    );

    return NextResponse.json({
      success: true,
      statistics: {
        mean: result?.NDVI_mean ?? null,
        min: result?.NDVI_min ?? null,
        max: result?.NDVI_max ?? null,
      },
    });
  } catch (error) {
    console.error(
      "NDVI statistics error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "NDVI statistics calculation failed",
      },
      { status: 500 }
    );
  }
}