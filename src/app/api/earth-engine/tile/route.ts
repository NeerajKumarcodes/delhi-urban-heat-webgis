import { NextRequest } from "next/server";
import { getEarthEngineAccessToken } from "@/lib/earthEngineRest";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const mapName = searchParams.get("map");
    const z = searchParams.get("z");
    const x = searchParams.get("x");
    const y = searchParams.get("y");

    if (!mapName || !z || !x || !y) {
      return new Response(
        "Missing map, z, x, or y parameter",
        { status: 400 }
      );
    }

    const token = await getEarthEngineAccessToken();

    const response = await fetch(
      `https://earthengine.googleapis.com/v1/${mapName}/tiles/${z}/${x}/${y}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Earth Engine tile error:",
        errorText
      );

      return new Response(errorText, {
        status: response.status,
      });
    }

    const contentType =
      response.headers.get("content-type") ||
      "image/png";

    const imageBuffer = await response.arrayBuffer();

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error(
      "Earth Engine tile route error:",
      error
    );

    return new Response(
      error instanceof Error
        ? error.message
        : "Earth Engine tile request failed",
      { status: 500 }
    );
  }
}