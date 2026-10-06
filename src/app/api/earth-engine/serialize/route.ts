import { NextResponse } from "next/server";
import ee from "@google/earthengine";
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

    const image = (ee.Image as any).constant(1);
    const serialized = image.serialize();

    return NextResponse.json({
      success: true,
      message: "Earth Engine serialization successful",
      serialized: JSON.parse(serialized),
    });
  } catch (error) {
    console.error(
      "Earth Engine serialization error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Earth Engine serialization failed",
      },
      { status: 500 }
    );
  }
}