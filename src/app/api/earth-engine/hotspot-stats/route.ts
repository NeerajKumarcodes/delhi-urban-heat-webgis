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

    // Create annual LST composite
    const landsatLST =
      landsat.map(calculateLST);

    const lstComposite =
      landsatLST
        .median()
        .clip(delhi);

    // Calculate 90th percentile threshold
    const percentile =
      lstComposite.reduceRegion({
        reducer:
          (ee.Reducer as any).percentile([90]),
        geometry: delhi.geometry(),
        scale: 30,
        maxPixels: 1e10,
      });

    const threshold =
      (percentile as any).get("LST");

    // Create hotspot mask
    const thresholdImage =
      (ee.Image as any).constant(
        threshold
      );

    const heatHotspots =
      lstComposite
        .gt(thresholdImage)
        .selfMask()
        .rename("Heat_Hotspots");

    // Calculate hotspot area in square meters
    const hotspotArea =
      (ee.Image as any).pixelArea()
        .updateMask(heatHotspots)
        .reduceRegion({
          reducer:
            (ee.Reducer as any).sum(),
          geometry: delhi.geometry(),
          scale: 30,
          maxPixels: 1e10,
        });

    // Calculate total valid LST area
    const totalArea =
      (ee.Image as any).pixelArea()
        .updateMask(lstComposite.mask())
        .reduceRegion({
          reducer:
            (ee.Reducer as any).sum(),
          geometry: delhi.geometry(),
          scale: 30,
          maxPixels: 1e10,
        });

    // Evaluate Earth Engine results
    const thresholdValue =
    await new Promise<number>(
        (resolve, reject) => {
        (threshold as any).evaluate(
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

    const hotspotAreaValue =
    await new Promise<number>(
        (resolve, reject) => {
        (hotspotArea as any)
            .get("area")
            .evaluate(
            (
                value: number,
                error: any
            ) => {
                if (error) {
                reject(error);
                return;
                }

                resolve(value);
            }
            );
        }
    );

    const totalAreaValue =
    await new Promise<number>(
        (resolve, reject) => {
        (totalArea as any)
            .get("area")
            .evaluate(
            (
                value: number,
                error: any
            ) => {
                if (error) {
                reject(error);
                return;
                }

                resolve(value);
            }
            );
        }
    );

    const hotspotAreaKm2 =
    hotspotAreaValue / 1_000_000;

    const totalAreaKm2 =
    totalAreaValue / 1_000_000;

    const hotspotPercentage =
    totalAreaKm2 > 0
        ? (hotspotAreaKm2 /
            totalAreaKm2) *
        100
        : 0;

    return NextResponse.json({
      success: true,
      threshold: thresholdValue,
      hotspotAreaKm2,
      hotspotPercentage,
      totalAreaKm2,
    });
  } catch (error) {
    console.error(
      "Heat hotspot statistics error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Heat hotspot statistics calculation failed",
      },
      { status: 500 }
    );
  }
}