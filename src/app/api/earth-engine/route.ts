import { NextResponse } from "next/server";
import { earthEngineRequest } from "@/lib/earthEngineRest";

export async function GET() {
  try {
    const result = await earthEngineRequest(
      "projects/eminent-tesla-467414-t6/maps",
      {
        expression: {
          values: {
            constantImage: {
              functionInvocationValue: {
                functionName: "Image.constant",
                arguments: {
                  value: {
                    constantValue: 1,
                  },
                },
              },
            },
          },
          result: "constantImage",
        },

        fileFormat: "PNG",

        visualizationOptions: {
          ranges: [
            {
              min: 0,
              max: 1,
            },
          ],
          paletteColors: ["000000", "FFFFFF"],
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Earth Engine map creation successful",
      result,
    });
  } catch (error) {
    console.error("Earth Engine map creation error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Earth Engine map creation failed",
      },
      { status: 500 }
    );
  }
}