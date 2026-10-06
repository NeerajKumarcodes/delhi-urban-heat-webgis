"use client";

import dynamic from "next/dynamic";

type ActiveLayer = "ndvi" | "lst" | "hotspots";

const Map = dynamic(() => import("./Map"), {
  ssr: false,
});

type MapWrapperProps = {
  activeLayer: ActiveLayer;
};

export default function MapWrapper({
  activeLayer,
}: MapWrapperProps) {
  return <Map activeLayer={activeLayer} />;
}