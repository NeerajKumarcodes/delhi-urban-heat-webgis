import { NextResponse } from "next/server";
import ee from "@google/earthengine";
import { createEarthEngineMap } from "@/lib/earthEngineRest";
import {
  getEarthEngineCredentials,
} from "@/lib/earthEngineRest";

const credentials =
  getEarthEngineCredentials();

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

    // --------------------------------------------------
    // 1. Delhi boundary
    // --------------------------------------------------

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

    // --------------------------------------------------
    // 2. Landsat 8 collection
    // --------------------------------------------------

    const landsat = (ee.ImageCollection as any)(
      "LANDSAT/LC08/C02/T1_L2"
    )
      .filterBounds(delhi)
      .filterDate(
        "2025-01-01",
        "2026-01-01"
      )
      .filter(
        (ee.Filter as any).lt(
          "CLOUD_COVER",
          20
        )
      );

    // --------------------------------------------------
    // 3. Convert ST_B10 to LST in Celsius
    // --------------------------------------------------

    function calculateLST(image: any) {
      const lst = image
        .select("ST_B10")
        .multiply(0.00341802)
        .add(149.0)
        .subtract(273.15)
        .rename("LST");

      return lst.copyProperties(
        image,
        ["system:time_start"]
      );
    }

    // --------------------------------------------------
    // 4. Create median LST composite
    // --------------------------------------------------

    const landsatLST =
      landsat.map(calculateLST);

    const lstComposite = landsatLST
      .median()
      .clip(delhi);

    // --------------------------------------------------
    // 5. Create Earth Engine map
    // --------------------------------------------------

    const expression = JSON.parse(
      lstComposite.serialize()
    );

    const map = await createEarthEngineMap(
      expression,
      {
        min: 15,
        max: 50,
        paletteColors: [
          "0000FF",
          "00FFFF",
          "008000",
          "FFFF00",
          "FFA500",
          "FF0000",
        ],
      }
    );

    return NextResponse.json({
      success: true,
      message:
        "Delhi LST map creation successful",
      map,
    });
  } catch (error) {
    console.error(
      "Delhi LST map creation error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Delhi LST map creation failed",
      },
      { status: 500 }
    );
  }
}