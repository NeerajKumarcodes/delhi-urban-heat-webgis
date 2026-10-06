import { NextResponse } from "next/server";
import ee from "@google/earthengine";

const credentials = require("../../../../../earth-engine-key.json");

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

    // Landsat 8 collection
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

    // Convert ST_B10 to Celsius
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

    // Create median LST composite
    const landsatLST =
      landsat.map(calculateLST);

    const lstComposite =
      landsatLST
        .median()
        .clip(delhi);

    // Calculate statistics
    const statistics =
      lstComposite.reduceRegion({
        reducer: (ee.Reducer as any)
          .mean()
          .combine({
            reducer2: (ee.Reducer as any)
              .minMax(),
            sharedInputs: true,
          }),
        geometry: delhi.geometry(),
        scale: 30,
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
        mean: result?.LST_mean ?? null,
        min: result?.LST_min ?? null,
        max: result?.LST_max ?? null,
      },
    });
  } catch (error) {
    console.error(
      "LST statistics error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "LST statistics calculation failed",
      },
      { status: 500 }
    );
  }
}