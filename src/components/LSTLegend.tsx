"use client";

export default function LSTLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] w-64 rounded-lg bg-white/95 p-3 shadow-lg">
      <div className="mb-2 text-sm font-semibold text-slate-800">
        Land Surface Temperature (°C)
      </div>

      <div
        className="h-4 w-full rounded"
        style={{
          background:
            "linear-gradient(to right, blue, cyan, green, yellow, orange, red)",
        }}
      />

      <div className="mt-1 flex justify-between text-xs text-slate-600">
        <span>15°C</span>
        <span>25°C</span>
        <span>35°C</span>
        <span>50°C</span>
      </div>

      <div className="mt-2 flex justify-between text-[11px] text-slate-500">
        <span>Cooler</span>
        <span>Hotter</span>
      </div>
    </div>
  );
}