"use client";

import {
  MapContainer,
  TileLayer,
  ScaleControl,
} from "react-leaflet";

import { useState } from "react";

import NDVILayer from "./NDVILayer";
import NDVILegend from "./NDVILegend";
import LSTLayer from "./LSTLayer";
import LSTLegend from "./LSTLegend";
import HeatHotspotsLayer from "./HeatHotspotsLayer";
import HeatHotspotsLegend from "./HeatHotspotsLegend";
import NorthArrow from "./NorthArrow";

import "leaflet/dist/leaflet.css";

type ActiveLayer =
  | "ndvi"
  | "lst"
  | "hotspots";

type MapProps = {
  activeLayer: ActiveLayer;
};

export default function Map({
  activeLayer,
}: MapProps) {
  const [hotspotThreshold, setHotspotThreshold] =
    useState<number | null>(null);

  const [opacity, setOpacity] =
    useState(0.75);

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[28.6139, 77.2090]}
        zoom={10}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <NorthArrow />

        <ScaleControl
          position="bottomright"
          imperial={false}
        />

        {activeLayer === "ndvi" && (
          <>
            <NDVILayer opacity={opacity} />
            <NDVILegend />
          </>
        )}

        {activeLayer === "lst" && (
          <>
            <LSTLayer opacity={opacity} />
            <LSTLegend />
          </>
        )}

        {activeLayer === "hotspots" && (
          <>
            <HeatHotspotsLayer
              opacity={opacity}
              onThresholdChange={
                setHotspotThreshold
              }
            />

            <HeatHotspotsLegend
              threshold={hotspotThreshold}
            />
          </>
        )}
      </MapContainer>

      <div className="absolute right-4 top-4 z-[1000] w-64 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur">
        <div className="text-sm font-semibold text-slate-900">
          Map Controls
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between">
            <label
              htmlFor="layer-opacity"
              className="text-xs font-medium text-slate-500"
            >
              Layer Opacity
            </label>

            <span className="text-xs font-semibold text-slate-700">
              {Math.round(
                opacity * 100
              )}
              %
            </span>
          </div>

          <input
            id="layer-opacity"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(event) =>
              setOpacity(
                Number(event.target.value)
              )
            }
            className="mt-2 w-full"
          />
        </div>
      </div>
    </div>
  );
}