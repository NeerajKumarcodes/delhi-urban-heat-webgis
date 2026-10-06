"use client";

export default function NDVILegend() {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] w-64 rounded-lg bg-white/95 p-3 shadow-lg">
      <div className="mb-2 text-sm font-semibold text-slate-800">
        NDVI
      </div>

      <div
        className="h-4 w-full rounded"
        style={{
          background:
            "linear-gradient(to right, blue, white, yellow, green, darkgreen)",
        }}
      />

      <div className="mt-1 flex justify-between text-xs text-slate-600">
        <span>-0.2</span>
        <span>0.0</span>
        <span>0.4</span>
        <span>0.8</span>
      </div>

      <div className="mt-2 flex justify-between text-[11px] text-slate-500">
        <span>Low vegetation</span>
        <span>High vegetation</span>
      </div>
    </div>
  );
}