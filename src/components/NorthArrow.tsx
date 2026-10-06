"use client";

export default function NorthArrow() {
  return (
    <div className="absolute left-16 top-4 z-[1000] flex h-14 w-12 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white/95 shadow-lg backdrop-blur">
      <div className="text-[11px] font-semibold text-slate-500">
        N
      </div>

      <div className="text-xl font-bold leading-5 text-slate-900">
        ↑
      </div>
    </div>
  );
}