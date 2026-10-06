"use client";

import { useState } from "react";

export default function MethodologyPanel() {
  const [open, setOpen] = useState(false);

  return (
    <section className="mx-auto max-w-[1600px] px-4 pb-6">
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-slate-800/60"
        >
          <div>
            <div className="text-sm font-semibold text-white">
              Methodology & Information
            </div>

            <div className="mt-1 text-xs text-slate-400">
              Data sources, processing workflow and analytical methods
            </div>
          </div>

          <span className="text-lg text-slate-400">
            {open ? "−" : "+"}
          </span>
        </button>

        {open && (
          <div className="border-t border-slate-800 px-5 py-5">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {/* Study Area */}
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Study Area
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Delhi, India, is used as the study area for
                  monitoring vegetation conditions and land
                  surface temperature.
                </p>
              </div>

              {/* Data Sources */}
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Satellite Data
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Sentinel-2 Surface Reflectance data are used
                  for NDVI, while Landsat 8 Collection 2 Level-2
                  data are used for land surface temperature.
                </p>
              </div>

              {/* NDVI */}
              <div>
                <h3 className="text-sm font-semibold text-white">
                  NDVI
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  NDVI is calculated using near-infrared (NIR)
                  and red reflectance:
                </p>

                <div className="mt-3 rounded-lg bg-slate-950 px-3 py-2 text-center text-sm font-medium text-slate-200">
                  NDVI = (NIR − Red) / (NIR + Red)
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Sentinel-2 bands: B8 (NIR) and B4 (Red)
                </p>
              </div>

              {/* LST */}
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Land Surface Temperature
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Landsat 8 thermal surface temperature data
                  are converted from the ST_B10 scaled values
                  into degrees Celsius.
                </p>

                <div className="mt-3 rounded-lg bg-slate-950 px-3 py-2 text-center text-sm font-medium text-slate-200">
                  LST = ST_B10 × 0.00341802 + 149 − 273.15
                </div>
              </div>

              {/* Temporal Processing */}
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Temporal Processing
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Satellite observations from 1 January 2025
                  through 31 December 2025 are filtered for
                  cloud cover and combined using a median
                  composite.
                </p>
              </div>

              {/* Heat Hotspots */}
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Heat Hotspots
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Areas with LST greater than the 90th percentile
                  of the analyzed LST distribution are classified
                  as heat hotspots.
                </p>
              </div>

              {/* Correlation */}
              <div>
                <h3 className="text-sm font-semibold text-white">
                  NDVI–LST Relationship
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Pearson correlation is used to measure the
                  linear relationship between sampled NDVI and
                  LST values at a common 30 m analysis scale.
                </p>
              </div>

              {/* Platform */}
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Processing Platform
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Google Earth Engine performs satellite data
                  filtering, compositing and spatial analysis.
                  The resulting map layers are delivered to the
                  WebGIS through the application backend.
                </p>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-800 pt-4">
              <p className="text-xs leading-5 text-slate-500">
                Note: Land surface temperature represents
                satellite-derived surface temperature rather
                than near-surface air temperature. Correlation
                indicates statistical association and does not
                by itself establish causation.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}