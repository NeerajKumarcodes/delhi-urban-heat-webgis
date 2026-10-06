"use client";

import {
  useEffect,
  useState,
} from "react";

import { TileLayer } from "react-leaflet";

type HotspotResponse = {
  success: boolean;
  threshold?: number;
  map?: {
    name: string;
  };
  message?: string;
};

type HeatHotspotsLayerProps = {
  opacity: number;
  onThresholdChange?: (
    threshold: number | null
  ) => void;
};

export default function HeatHotspotsLayer({
  opacity,
  onThresholdChange,
}: HeatHotspotsLayerProps) {
  const [mapName, setMapName] =
    useState<string | null>(null);

  useEffect(() => {
    async function loadHotspots() {
      try {
        const response = await fetch(
          "/api/earth-engine/hotspots"
        );

        const data: HotspotResponse =
          await response.json();

        if (
          !data.success ||
          !data.map?.name
        ) {
          console.error(
            "Failed to create heat hotspot map:",
            data.message
          );

          return;
        }

        setMapName(data.map.name);

        if (
          data.threshold !== undefined
        ) {
          onThresholdChange?.(
            data.threshold
          );
        }
      } catch (error) {
        console.error(
          "Heat hotspot layer error:",
          error
        );
      }
    }

    loadHotspots();
  }, [onThresholdChange]);

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