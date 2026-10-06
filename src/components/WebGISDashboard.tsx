"use client";

import { useEffect, useState } from "react";
import MapWrapper from "@/components/MapWrapper";
import NDVILSTScatterPlot from "@/components/NDVILSTScatterPlot";
import MethodologyPanel from "./MethodologyPanel";

type ActiveLayer = "ndvi" | "lst" | "hotspots";

type NDVIStatsResponse = {
  success: boolean;
  statistics?: {
    mean: number | null;
    min: number | null;
    max: number | null;
  };
  message?: string;
};

type LSTStatsResponse = {
  success: boolean;
  statistics?: {
    mean: number | null;
    min: number | null;
    max: number | null;
  };
  message?: string;
};

type CorrelationResponse = {
  success: boolean;
  correlation?: number | null;
  message?: string;
};

type SamplePoint = {
  ndvi: number;
  lst: number;
};

type SamplesResponse = {
  success: boolean;
  count?: number;
  data?: SamplePoint[];
  message?: string;
};

type HotspotStats = {
  threshold: number | null;
  hotspotAreaKm2: number | null;
  hotspotPercentage: number | null;
  totalAreaKm2: number | null;
};

export default function WebGISDashboard() {
  const [activeLayer, setActiveLayer] =
    useState<ActiveLayer>("ndvi");

  const [ndviStats, setNdviStats] =
    useState<NDVIStatsResponse["statistics"]>(
      undefined
    );

  const [lstStats, setLstStats] =
    useState<LSTStatsResponse["statistics"]>(
      undefined
    );

  const [correlation, setCorrelation] =
    useState<number | null>(null);

  const [sampleData, setSampleData] =
    useState<SamplePoint[]>([]);

  const [hotspotStats, setHotspotStats] =
  useState<HotspotStats>({
    threshold: null,
    hotspotAreaKm2: null,
    hotspotPercentage: null,
    totalAreaKm2: null,
  });

  useEffect(() => {
    async function loadStatistics() {
      try {
        const [
        ndviResponse,
        lstResponse,
        correlationResponse,
        samplesResponse,
        hotspotResponse,
        ] = await Promise.all([
        fetch("/api/earth-engine/ndvi-stats"),
        fetch("/api/earth-engine/lst-stats"),
        fetch("/api/earth-engine/correlation"),
        fetch("/api/earth-engine/ndvi-lst-samples"),
        fetch("/api/earth-engine/hotspot-stats"),
        ]);

        const ndviData: NDVIStatsResponse =
          await ndviResponse.json();

        const lstData: LSTStatsResponse =
          await lstResponse.json();

        const correlationData: CorrelationResponse =
          await correlationResponse.json();

        const samplesData: SamplesResponse =
          await samplesResponse.json();

        const hotspotData =
        await hotspotResponse.json();

        if (
          ndviData.success &&
          ndviData.statistics
        ) {
          setNdviStats(
            ndviData.statistics
          );
        } else {
          console.error(
            "Failed to load NDVI statistics:",
            ndviData.message
          );
        }

        if (
          lstData.success &&
          lstData.statistics
        ) {
          setLstStats(
            lstData.statistics
          );
        } else {
          console.error(
            "Failed to load LST statistics:",
            lstData.message
          );
        }

        if (
          correlationData.success &&
          correlationData.correlation !==
            undefined &&
          correlationData.correlation !== null
        ) {
          setCorrelation(
            correlationData.correlation
          );
        } else {
          console.error(
            "Failed to load NDVI-LST correlation:",
            correlationData.message
          );
        }

        if (
        samplesData.success &&
        samplesData.data
        ) {
        setSampleData(samplesData.data);
        } else {
        console.error(
            "Failed to load NDVI-LST samples:",
            samplesData.message
        );
        }

        if (hotspotData.success) {
        setHotspotStats({
            threshold:
            hotspotData.threshold ?? null,
            hotspotAreaKm2:
            hotspotData.hotspotAreaKm2 ?? null,
            hotspotPercentage:
            hotspotData.hotspotPercentage ?? null,
            totalAreaKm2:
            hotspotData.totalAreaKm2 ?? null,
        });
        }
      } catch (error) {
        console.error(
          "Statistics loading error:",
          error
        );
      }
    }

    loadStatistics();
  }, []);

    function getCorrelationInterpretation(
        value: number | null
    ) {
        if (value === null) {
        return {
            label: "Calculating...",
            description:
            "The NDVI–LST relationship is being calculated.",
        };
        }

        const absoluteValue = Math.abs(value);

        let strength = "";

        if (absoluteValue < 0.2) {
        strength = "Very weak";
        } else if (absoluteValue < 0.4) {
        strength = "Weak";
        } else if (absoluteValue < 0.6) {
        strength = "Moderate";
        } else if (absoluteValue < 0.8) {
        strength = "Strong";
        } else {
        strength = "Very strong";
        }

        if (value < 0) {
        return {
            label: `${strength} negative relationship`,
            description:
            "Higher vegetation tends to be associated with lower land surface temperature.",
        };
        }

        if (value > 0) {
        return {
            label: `${strength} positive relationship`,
            description:
            "Higher vegetation tends to be associated with higher land surface temperature.",
        };
        }

        return {
        label: "No linear relationship",
        description:
            "The analysis does not show a linear relationship between NDVI and LST.",
        };
    }

    const correlationInterpretation =
        getCorrelationInterpretation(correlation);

  return (
    <>
      {/* Main application */}
      <section className="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 p-4 lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Layers
          </h2>

          <div className="mt-5 space-y-3">
            {/* NDVI */}
            <button
                type="button"
                onClick={() =>
                setActiveLayer("ndvi")
                }
                className={`w-full rounded-lg border p-3 text-left transition ${
                activeLayer === "ndvi"
                    ? "border-green-500 bg-green-500/10"
                    : "border-slate-700 bg-slate-800 hover:border-slate-600"
                }`}
            >
                <div className="flex items-center justify-between">
                <div className="font-medium text-white">
                    NDVI
                </div>

                <span className="rounded bg-green-500/10 px-2 py-0.5 text-[10px] font-medium text-green-400">
                    10 m
                </span>
                </div>

                <div className="mt-1 text-xs text-slate-400">
                Vegetation condition
                </div>

                <div className="mt-2 text-[11px] text-slate-500">
                Sentinel-2 · NIR & Red
                </div>
            </button>

            {/* LST */}
            <button
                type="button"
                onClick={() =>
                setActiveLayer("lst")
                }
                className={`w-full rounded-lg border p-3 text-left transition ${
                activeLayer === "lst"
                    ? "border-orange-500 bg-orange-500/10"
                    : "border-slate-700 bg-slate-800 hover:border-slate-600"
                }`}
            >
                <div className="flex items-center justify-between">
                <div className="font-medium text-white">
                    Land Surface Temperature
                </div>

                <span className="rounded bg-orange-500/10 px-2 py-0.5 text-[10px] font-medium text-orange-400">
                    30 m
                </span>
                </div>

                <div className="mt-1 text-xs text-slate-400">
                Surface temperature
                </div>

                <div className="mt-2 text-[11px] text-slate-500">
                Landsat 8 · Thermal Band
                </div>
            </button>

            {/* Heat Hotspots */}
            <button
                type="button"
                onClick={() =>
                setActiveLayer("hotspots")
                }
                className={`w-full rounded-lg border p-3 text-left transition ${
                activeLayer === "hotspots"
                    ? "border-red-500 bg-red-500/10"
                    : "border-slate-700 bg-slate-800 hover:border-slate-600"
                }`}
            >
                <div className="flex items-center justify-between">
                <div className="font-medium text-white">
                    Heat Hotspots
                </div>

                <span className="rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400">
                    LST
                </span>
                </div>

                <div className="mt-1 text-xs text-slate-400">
                Areas above the 90th percentile
                </div>

                <div className="mt-2 text-[11px] text-slate-500">
                Derived from Landsat 8 LST
                </div>
            </button>
            </div>

          {/* Study Area */}
          <div className="mt-8 border-t border-slate-800 pt-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              Study Area
            </h2>

            <p className="mt-3 text-sm text-slate-300">
              Delhi, India
            </p>
          </div>
        </aside>

        {/* Interactive map */}
        <div className="min-h-[600px] overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          <MapWrapper
            activeLayer={activeLayer}
          />
        </div>
      </section>

      {/* NDVI Statistics */}
      <section className="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 px-4 pb-6 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="text-sm text-slate-400">
            Mean NDVI
          </div>

          <div className="mt-2 text-2xl font-semibold">
            {ndviStats?.mean !== null &&
            ndviStats?.mean !== undefined
              ? ndviStats.mean.toFixed(4)
              : "Loading..."}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="text-sm text-slate-400">
            Minimum NDVI
          </div>

          <div className="mt-2 text-2xl font-semibold">
            {ndviStats?.min !== null &&
            ndviStats?.min !== undefined
              ? ndviStats.min.toFixed(4)
              : "Loading..."}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="text-sm text-slate-400">
            Maximum NDVI
          </div>

          <div className="mt-2 text-2xl font-semibold">
            {ndviStats?.max !== null &&
            ndviStats?.max !== undefined
              ? ndviStats.max.toFixed(4)
              : "Loading..."}
          </div>
        </div>
      </section>

      {/* LST Statistics */}
      <section className="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 px-4 pb-6 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="text-sm text-slate-400">
            Mean LST
          </div>

          <div className="mt-2 text-2xl font-semibold">
            {lstStats?.mean !== null &&
            lstStats?.mean !== undefined
              ? `${lstStats.mean.toFixed(2)}°C`
              : "Loading..."}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="text-sm text-slate-400">
            Minimum LST
          </div>

          <div className="mt-2 text-2xl font-semibold">
            {lstStats?.min !== null &&
            lstStats?.min !== undefined
              ? `${lstStats.min.toFixed(2)}°C`
              : "Loading..."}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="text-sm text-slate-400">
            Maximum LST
          </div>

          <div className="mt-2 text-2xl font-semibold">
            {lstStats?.max !== null &&
            lstStats?.max !== undefined
              ? `${lstStats.max.toFixed(2)}°C`
              : "Loading..."}
          </div>
        </div>
      </section>

      {/* NDVI-LST Relationship */}
      <section className="mx-auto max-w-[1600px] px-4 pb-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
          <div className="text-sm text-slate-400">
            NDVI–LST Correlation
          </div>

          <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-end sm:gap-3">
            <div className="text-3xl font-semibold text-white">
              {correlation !== null
                ? correlation.toFixed(4)
                : "Loading..."}
            </div>

            <div className="pb-1 text-sm font-medium text-slate-300">
              {correlationInterpretation.label}
            </div>
          </div>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            {correlationInterpretation.description}
          </p>

          <div className="mt-3 text-xs text-slate-500">
            Pearson correlation coefficient · Values closer to
            −1 indicate a stronger negative linear relationship,
            while values closer to +1 indicate a stronger
            positive linear relationship.
          </div>
        </div>
      </section>
            {/* NDVI-LST Scatter Plot */}
        <section className="mx-auto max-w-[1600px] px-4 pb-6">
            <NDVILSTScatterPlot
            data={sampleData}
            correlation={correlation}
            />
        </section>

        {/* Heat Hotspot Statistics */}
        <section className="mx-auto max-w-[1600px] px-4 pb-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <div className="text-sm font-semibold text-white">
            Heat Hotspot Statistics
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Hotspot Area */}
            <div className="rounded-lg bg-slate-950 p-4">
                <div className="text-sm text-slate-400">
                Hotspot Area
                </div>

                <div className="mt-2 text-2xl font-semibold text-white">
                {hotspotStats.hotspotAreaKm2 !== null
                    ? `${hotspotStats.hotspotAreaKm2.toFixed(2)} km²`
                    : "Loading..."}
                </div>
            </div>

            {/* Hotspot Percentage */}
            <div className="rounded-lg bg-slate-950 p-4">
                <div className="text-sm text-slate-400">
                Hotspot Coverage
                </div>

                <div className="mt-2 text-2xl font-semibold text-red-400">
                {hotspotStats.hotspotPercentage !== null
                    ? `${hotspotStats.hotspotPercentage.toFixed(2)}%`
                    : "Loading..."}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                of analyzed LST area
                </div>
            </div>

            {/* Threshold */}
            <div className="rounded-lg bg-slate-950 p-4">
                <div className="text-sm text-slate-400">
                Hotspot Threshold
                </div>

                <div className="mt-2 text-2xl font-semibold text-white">
                {hotspotStats.threshold !== null
                    ? `${hotspotStats.threshold.toFixed(2)}°C`
                    : "Loading..."}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                90th percentile of LST
                </div>
            </div>
            </div>

            <div className="mt-4 border-t border-slate-800 pt-3 text-xs text-slate-500">
            Hotspots represent areas where land surface temperature
            exceeds the 90th percentile threshold of the analyzed
            2025 LST distribution.
            </div>
        </div>
        </section>

        <MethodologyPanel />
    </>
  );
}