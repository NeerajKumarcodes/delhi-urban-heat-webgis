"use client";

import { useEffect, useState } from "react";
import { TileLayer } from "react-leaflet";

type LSTResponse = {
  success: boolean;
  map?: {
    name: string;
  };
  message?: string;
};

type LSTLayerProps = {
  opacity: number;
};

export default function LSTLayer({
  opacity,
}: LSTLayerProps) {
  const [mapName, setMapName] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadLST() {
      try {
        const response = await fetch(
          "/api/earth-engine/lst"
        );

        const data: LSTResponse =
          await response.json();

        if (
          !data.success ||
          !data.map?.name
        ) {
          console.error(
            "Failed to create LST map:",
            data.message
          );
          return;
        }

        setMapName(data.map.name);
      } catch (error) {
        console.error(
          "LST layer error:",
          error
        );
      }
    }

    loadLST();
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