"use client";

import { useEffect, useState } from "react";
import { TileLayer } from "react-leaflet";

type NDVIResponse = {
  success: boolean;
  map?: {
    name: string;
  };
  message?: string;
};

type NDVILayerProps = {
  opacity: number;
};

export default function NDVILayer({
  opacity,
}: NDVILayerProps) {
  const [mapName, setMapName] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadNDVI() {
      try {
        const response = await fetch(
          "/api/earth-engine/ndvi"
        );

        const data: NDVIResponse =
          await response.json();

        if (
          !data.success ||
          !data.map?.name
        ) {
          console.error(
            "Failed to create NDVI map:",
            data.message
          );
          return;
        }

        setMapName(data.map.name);
      } catch (error) {
        console.error(
          "NDVI layer error:",
          error
        );
      }
    }

    loadNDVI();
  }, []);

  if (!mapName) {
    return null;
  }

  const tileUrl =
    `/api/earth-engine/tile?map=${encodeURIComponent(
      mapName
    )}&z={z}&x={x}&y={y}`;

  return (
    <TileLayer
      url={tileUrl}
      opacity={opacity}
      attribution="Google Earth Engine"
    />
  );
}