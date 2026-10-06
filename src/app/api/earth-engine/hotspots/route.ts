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

    // Create LST composite
    const landsatLST =
      landsat.map(calculateLST);

    const lstComposite = landsatLST
      .median()
      .clip(delhi);

    // Calculate the 90th percentile
    const percentile = lstComposite.reduceRegion({
      reducer: (ee.Reducer as any).percentile([90]),
      geometry: delhi.geometry(),
      scale: 30,
      maxPixels: 1e10,
    });

    // Create hotspot mask
    const threshold = (percentile as any).get("LST");

    const thresholdImage = (ee.Image as any).constant(
    threshold
    );

    const heatHotspots = lstComposite
    .gt(thresholdImage)
    .selfMask()
    .rename("Heat_Hotspots");

    // Serialize Earth Engine expression
    const expression = JSON.parse(
      heatHotspots.serialize()
    );

    // Create map tiles
    const map = await createEarthEngineMap(
      expression,
      {
        min: 0,
        max: 1,
        paletteColors: [
          "FF0000",
        ],
      }
    );

    const thresholdValue =
    await new Promise<number>(
        (resolve, reject) => {
        threshold.evaluate(
            (value: number, error: any) => {
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
    message:
        "Delhi heat hotspot map creation successful",
    threshold: thresholdValue,
    map,
    });
  } catch (error) {
    console.error(
      "Delhi heat hotspot map creation error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Delhi heat hotspot map creation failed",
      },
      { status: 500 }
    );
  }
}