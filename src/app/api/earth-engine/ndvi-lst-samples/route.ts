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

    // --------------------------------------------------
    // DELHI BOUNDARY
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
    // SENTINEL-2 NDVI
    // --------------------------------------------------

    const sentinel2 =
      (ee.ImageCollection as any)(
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

    const sentinel2Clean =
      sentinel2.map(maskS2Clouds);

    const sentinelComposite =
      sentinel2Clean
        .median()
        .clip(delhi);

    // Calculate NDVI
    const ndvi =
      sentinelComposite
        .normalizedDifference([
          "B8",
          "B4",
        ])
        .rename("NDVI");

    // --------------------------------------------------
    // LANDSAT 8 LST
    // --------------------------------------------------

    const landsat =
      (ee.ImageCollection as any)(
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

    const landsatLST =
      landsat.map(calculateLST);

    const lstComposite =
      landsatLST
        .median()
        .clip(delhi);

    // --------------------------------------------------
    // RESAMPLE NDVI TO 30 m
    // --------------------------------------------------

    const ndvi30m = ndvi
      .resample("bilinear")
      .reproject({
        crs: lstComposite.projection(),
        scale: 30,
      });

    // --------------------------------------------------
    // COMBINE NDVI + LST
    // --------------------------------------------------

    const combined = ndvi30m
      .addBands(lstComposite)
      .updateMask(
        ndvi30m.mask().and(
          lstComposite.mask()
        )
      );

    // --------------------------------------------------
    // SAMPLE REPRESENTATIVE PIXELS
    // --------------------------------------------------

    const samples = combined.sample({
      region: delhi.geometry(),
      scale: 30,
      numPixels: 1500,
      seed: 42,
      geometries: false,
    });

    // --------------------------------------------------
    // EVALUATE RESULTS
    // --------------------------------------------------

    const result = await new Promise<any>(
      (resolve, reject) => {
        samples.evaluate(
          (
            value: any,
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

    // --------------------------------------------------
    // RETURN NDVI-LST PAIRS
    // --------------------------------------------------

    const data =
      (result?.features || [])
        .map((feature: any) => ({
          ndvi: feature?.properties?.NDVI,
          lst: feature?.properties?.LST,
        }))
        .filter(
          (point: any) =>
            typeof point.ndvi ===
              "number" &&
            typeof point.lst ===
              "number"
        );

    return NextResponse.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error(
      "NDVI-LST sample generation error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "NDVI-LST sample generation failed",
      },
      { status: 500 }
    );
  }
}