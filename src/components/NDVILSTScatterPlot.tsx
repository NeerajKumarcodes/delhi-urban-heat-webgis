"use client";

import { useMemo, useState } from "react";

type SamplePoint = {
  ndvi: number;
  lst: number;
};

type NDVILSTScatterPlotProps = {
  data: SamplePoint[];
  correlation: number | null;
};

export default function NDVILSTScatterPlot({
  data,
  correlation,
}: NDVILSTScatterPlotProps) {
  const [hoveredPoint, setHoveredPoint] =
    useState<SamplePoint | null>(null);

  // --------------------------------------------------
  // CHART DIMENSIONS
  // --------------------------------------------------

  const width = 1000;
  const height = 500;

  const margin = {
    top: 30,
    right: 35,
    bottom: 70,
    left: 85,
  };

  const plotWidth =
    width - margin.left - margin.right;

  const plotHeight =
    height - margin.top - margin.bottom;

  // --------------------------------------------------
  // X-AXIS RANGE
  // --------------------------------------------------

  const xMin = -0.5;
  const xMax = 1;

  // --------------------------------------------------
  // Y-AXIS RANGE
  // --------------------------------------------------

  const yRange = useMemo(() => {
    if (data.length === 0) {
      return {
        min: 15,
        max: 45,
      };
    }

    const values = data.map(
      (point) => point.lst
    );

    const min = Math.min(...values);
    const max = Math.max(...values);

    const padding = Math.max(
      (max - min) * 0.08,
      1
    );

    return {
      min: Math.floor(min - padding),
      max: Math.ceil(max + padding),
    };
  }, [data]);

  const yMin = yRange.min;
  const yMax = yRange.max;

  // --------------------------------------------------
  // COORDINATE CONVERSION
  // --------------------------------------------------

  function xScale(value: number) {
    return (
      margin.left +
      ((value - xMin) /
        (xMax - xMin)) *
        plotWidth
    );
  }

  function yScale(value: number) {
    return (
      margin.top +
      (1 -
        (value - yMin) /
          (yMax - yMin)) *
        plotHeight
    );
  }

  // --------------------------------------------------
  // LINEAR REGRESSION
  // --------------------------------------------------

  const regression = useMemo(() => {
    if (data.length < 2) {
      return null;
    }

    const n = data.length;

    const sumX = data.reduce(
      (sum, point) => sum + point.ndvi,
      0
    );

    const sumY = data.reduce(
      (sum, point) => sum + point.lst,
      0
    );

    const sumXY = data.reduce(
      (sum, point) =>
        sum + point.ndvi * point.lst,
      0
    );

    const sumX2 = data.reduce(
      (sum, point) =>
        sum + point.ndvi * point.ndvi,
      0
    );

    const denominator =
      n * sumX2 - sumX * sumX;

    if (denominator === 0) {
      return null;
    }

    const slope =
      (n * sumXY - sumX * sumY) /
      denominator;

    const intercept =
      (sumY - slope * sumX) / n;

    return {
      slope,
      intercept,
    };
  }, [data]);

  // --------------------------------------------------
  // REGRESSION LINE
  // --------------------------------------------------

  const regressionLine = useMemo(() => {
    if (!regression) {
      return null;
    }

    const x1 = xMin;
    const x2 = xMax;

    const y1 =
      regression.slope * x1 +
      regression.intercept;

    const y2 =
      regression.slope * x2 +
      regression.intercept;

    return {
      x1: xScale(x1),
      y1: yScale(y1),
      x2: xScale(x2),
      y2: yScale(y2),
    };
  }, [
    regression,
    yMin,
    yMax,
  ]);

  // --------------------------------------------------
  // AXIS TICKS
  // --------------------------------------------------

  const xTicks = [
    -0.5,
    -0.25,
    0,
    0.25,
    0.5,
    0.75,
    1,
  ];

  const yStep = 5;

  const yTicks: number[] = [];

  for (
    let value =
      Math.ceil(yMin / yStep) *
      yStep;
    value <= yMax;
    value += yStep
  ) {
    yTicks.push(value);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-700 bg-white shadow-lg">
      {/* Header */}
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-lg font-semibold text-slate-900">
          NDVI vs Land Surface Temperature
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Relationship between vegetation and surface
          temperature across sampled Delhi pixels
        </p>
      </div>

      {/* Chart */}
      <div className="relative w-full px-4 py-4">
        {data.length > 0 ? (
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-auto w-full"
            role="img"
            aria-label="Scatter plot showing the relationship between NDVI and land surface temperature"
          >

            <defs>
            <clipPath id="plotClip">
                <rect
                x={margin.left}
                y={margin.top}
                width={plotWidth}
                height={plotHeight}
                />
            </clipPath>
            </defs>
            {/* Background */}
            <rect
              x={margin.left}
              y={margin.top}
              width={plotWidth}
              height={plotHeight}
              fill="#ffffff"
            />

            {/* Horizontal grid */}
            {yTicks.map((tick) => (
              <line
                key={`y-grid-${tick}`}
                x1={margin.left}
                x2={width - margin.right}
                y1={yScale(tick)}
                y2={yScale(tick)}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
              />
            ))}

            {/* Vertical grid */}
            {xTicks.map((tick) => (
              <line
                key={`x-grid-${tick}`}
                x1={xScale(tick)}
                x2={xScale(tick)}
                y1={margin.top}
                y2={
                  height -
                  margin.bottom
                }
                stroke="#e2e8f0"
                strokeDasharray="4 4"
              />
            ))}

            {/* Y-axis */}
            <line
              x1={margin.left}
              x2={margin.left}
              y1={margin.top}
              y2={
                height -
                margin.bottom
              }
              stroke="#64748b"
              strokeWidth="1"
            />

            {/* X-axis */}
            <line
              x1={margin.left}
              x2={
                width -
                margin.right
              }
              y1={
                height -
                margin.bottom
              }
              y2={
                height -
                margin.bottom
              }
              stroke="#64748b"
              strokeWidth="1"
            />

            {/* X-axis ticks and labels */}
            {xTicks.map((tick) => (
              <g key={`x-tick-${tick}`}>
                <line
                  x1={xScale(tick)}
                  x2={xScale(tick)}
                  y1={
                    height -
                    margin.bottom
                  }
                  y2={
                    height -
                    margin.bottom +
                    6
                  }
                  stroke="#64748b"
                />

                <text
                  x={xScale(tick)}
                  y={
                    height -
                    margin.bottom +
                    25
                  }
                  textAnchor="middle"
                  fill="#475569"
                  fontSize="13"
                >
                  {tick.toFixed(2)}
                </text>
              </g>
            ))}

            {/* Y-axis ticks and labels */}
            {yTicks.map((tick) => (
              <g key={`y-tick-${tick}`}>
                <line
                  x1={margin.left - 6}
                  x2={margin.left}
                  y1={yScale(tick)}
                  y2={yScale(tick)}
                  stroke="#64748b"
                />

                <text
                  x={margin.left - 12}
                  y={
                    yScale(tick) + 4
                  }
                  textAnchor="end"
                  fill="#475569"
                  fontSize="13"
                >
                  {tick}
                </text>
              </g>
            ))}

            {/* Y-axis label */}
            <text
              x="20"
              y={height / 2}
              textAnchor="middle"
              fill="#334155"
              fontSize="14"
              fontWeight="500"
              transform={`rotate(-90 20 ${
                height / 2
              })`}
            >
              Land Surface Temperature (°C)
            </text>

            {/* X-axis label */}
            <text
              x={width / 2}
              y={height - 18}
              textAnchor="middle"
              fill="#334155"
              fontSize="14"
              fontWeight="500"
            >
              NDVI
            </text>

            {/* --------------------------------------------------
                BLUE SAMPLE POINTS
                -------------------------------------------------- */}

            {data.map((point, index) => (
              <circle
                key={index}
                cx={xScale(point.ndvi)}
                cy={yScale(point.lst)}
                r="3.2"
                fill="#2563eb"
                fillOpacity="0.38"
                stroke="#2563eb"
                strokeOpacity="0.15"
                onMouseEnter={() =>
                  setHoveredPoint(point)
                }
                onMouseLeave={() =>
                  setHoveredPoint(null)
                }
              />
            ))}

            {/* --------------------------------------------------
                RED REGRESSION LINE
                IMPORTANT: DRAWN AFTER THE POINTS
                -------------------------------------------------- */}

            {regressionLine && (
            <line
                x1={regressionLine.x1}
                y1={regressionLine.y1}
                x2={regressionLine.x2}
                y2={regressionLine.y2}
                stroke="#dc2626"
                strokeWidth="1.5"
                strokeLinecap="round"
                clipPath="url(#plotClip)"
            />
            )}

          </svg>
        ) : (
          <div className="flex h-[460px] items-center justify-center text-sm text-slate-500">
            Loading scatter plot data...
          </div>
        )}

        {/* Hover information */}
        {hoveredPoint && (
          <div className="pointer-events-none absolute right-8 top-8 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
            <div className="font-medium text-slate-800">
              Sampled pixel
            </div>

            <div className="mt-1 text-slate-500">
              NDVI:{" "}
              <span className="font-medium text-slate-800">
                {hoveredPoint.ndvi.toFixed(4)}
              </span>
            </div>

            <div className="text-slate-500">
              LST:{" "}
              <span className="font-medium text-slate-800">
                {hoveredPoint.lst.toFixed(2)}°C
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Trend information */}
      <div className="border-t border-slate-200 bg-slate-50 px-6 py-3">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="inline-block h-1 w-7 rounded-full bg-red-600" />

          <span>
            Linear regression trend
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-2 border-t border-slate-200 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-slate-500">
          Sampled observations:{" "}
          <span className="font-medium text-slate-800">
            {data.length}
          </span>
        </div>

        <div className="text-sm text-slate-500">
          Pearson correlation:{" "}
          <span className="font-semibold text-slate-900">
            {correlation !== null
              ? correlation.toFixed(4)
              : "Loading..."}
          </span>
        </div>
      </div>
    </div>
  );
}