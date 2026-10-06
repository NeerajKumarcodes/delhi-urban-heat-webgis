"use client";

type HeatHotspotsLegendProps = {
  threshold: number | null;
};

export default function HeatHotspotsLegend({
  threshold,
}: HeatHotspotsLegendProps) {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] w-64 rounded-lg bg-white/95 p-3 shadow-lg">
      <div className="mb-2 text-sm font-semibold text-slate-800">
        Heat Hotspots
      </div>

      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded-sm bg-red-600" />

        <span className="text-xs text-slate-600">
          LST &gt; 90th percentile
        </span>
      </div>

      <div className="mt-2 text-[11px] text-slate-500">
        Threshold:{" "}
        {threshold !== null
          ? `${threshold.toFixed(2)}°C`
          : "Loading..."}
      </div>
    </div>
  );
}