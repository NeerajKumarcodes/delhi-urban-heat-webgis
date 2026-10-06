# Urban Heat & Green Cover Monitoring WebGIS

An interactive WebGIS for monitoring **vegetation health, land surface temperature, and urban heat hotspots across Delhi, India**, using satellite remote sensing and Google Earth Engine.

The application combines **Sentinel-2 NDVI** and **Landsat 8 Land Surface Temperature (LST)** with interactive geospatial visualization and statistical analysis to explore the relationship between vegetation and surface temperature.

## 🌐 Live Application

**[Open the Delhi Urban Heat WebGIS](https://delhi-urban-heat-webgis.vercel.app/)**

---

## 📌 Project Overview

Urbanization can significantly alter the surface characteristics of a city, often reducing vegetation and increasing land surface temperatures.

This project provides an interactive web-based platform to:

* Visualize vegetation conditions using **NDVI**
* Visualize **Land Surface Temperature (LST)**
* Identify areas experiencing relatively high surface temperatures
* Analyze the relationship between vegetation and surface temperature
* Explore satellite-derived environmental information interactively on a map

The study area is **Delhi, India**, with satellite data processed through **Google Earth Engine**.

---

## 🎯 Objectives

1. Generate an **NDVI layer** using Sentinel-2 satellite imagery.
2. Generate a **Land Surface Temperature (LST)** layer using Landsat 8 thermal data.
3. Analyze the relationship between vegetation and surface temperature.
4. Identify urban heat hotspot areas using a dynamic statistical threshold.
5. Develop an interactive WebGIS for visualizing and exploring the results.

---

## ✨ Key Features

### 🟢 NDVI Mapping

Displays vegetation conditions across Delhi using the **Normalized Difference Vegetation Index (NDVI)**.

**Data source:** Sentinel-2 Surface Reflectance

**Resolution:** 10 m

**Formula:**

```text
NDVI = (NIR - Red) / (NIR + Red)
```

For Sentinel-2:

```text
NDVI = (B8 - B4) / (B8 + B4)
```

---

### 🌡️ Land Surface Temperature

Displays satellite-derived land surface temperature across Delhi.

**Data source:** Landsat 8 Collection 2 Level-2

**Thermal band:** ST_B10

**Resolution:** 30 m

The thermal data is converted to Celsius before visualization and analysis.

---

### 🔥 Dynamic Heat Hotspots

Heat hotspots are derived dynamically from the LST dataset using the **90th percentile threshold**.

Instead of using an arbitrary fixed temperature, the application calculates a threshold from the analyzed LST distribution.

Areas above this threshold are classified as relatively hotter areas.

---

### 📊 NDVI Statistics

The application dynamically calculates:

* Mean NDVI
* Minimum NDVI
* Maximum NDVI

---

### 🌡️ LST Statistics

The application dynamically calculates:

* Mean LST
* Minimum LST
* Maximum LST

---

### 📈 NDVI–LST Correlation

The application calculates the **Pearson correlation coefficient** between NDVI and LST.

The analysis resamples NDVI to the 30 m LST spatial scale before calculating the correlation.

A negative correlation indicates that areas with higher vegetation values tend to be associated with lower surface temperatures within the analyzed dataset.

> Correlation represents statistical association and should not be interpreted as proof of causation.

---

### 🔵 NDVI–LST Scatter Plot

The dashboard provides an interactive scatter plot showing sampled NDVI and LST observations.

The visualization includes:

* NDVI values on the X-axis
* LST values on the Y-axis
* Sampled observations
* Linear regression line

This provides an intuitive visual representation of the vegetation–temperature relationship.

---

### 🗺️ Interactive WebGIS

The map interface provides:

* Interactive panning and zooming
* NDVI visualization
* LST visualization
* Heat hotspot visualization
* Layer opacity control
* Dynamic legends
* Scale bar
* North arrow
* Active layer indication

---

## 🛰️ Remote Sensing Data

| Dataset                        | Purpose | Resolution |
| ------------------------------ | ------- | ---------: |
| Sentinel-2 Surface Reflectance | NDVI    |       10 m |
| Landsat 8 Collection 2 Level-2 | LST     |       30 m |

### Sentinel-2

Google Earth Engine dataset:

```text
COPERNICUS/S2_SR_HARMONIZED
```

### Landsat 8

Google Earth Engine dataset:

```text
LANDSAT/LC08/C02/T1_L2
```

---

## 📅 Temporal Analysis

The current implementation uses satellite observations from:

```text
January 1, 2025 → January 1, 2026
```

The application generates composite datasets from the available imagery within this period.

The current analysis therefore represents a **2025 annual baseline**, rather than a single-day or single-scene observation.

---

## 🧮 Processing Methodology

### 1. Define Study Area

The Delhi administrative boundary is obtained using the Global Administrative Areas dataset in Google Earth Engine.

```text
FAO/GAUL/2015/level1
```

---

### 2. Sentinel-2 Processing

The Sentinel-2 Surface Reflectance collection is filtered using:

* Delhi boundary
* Analysis date range
* Cloud percentage

Cloud and cirrus pixels are masked using the QA60 quality band.

Reflectance values are scaled before calculating NDVI.

A median composite is generated and clipped to the Delhi boundary.

---

### 3. NDVI Calculation

NDVI is calculated using Sentinel-2 NIR and red bands:

```text
NDVI = (B8 - B4) / (B8 + B4)
```

---

### 4. Landsat 8 Processing

Landsat 8 Collection 2 Level-2 imagery is filtered using:

* Delhi boundary
* Analysis date range
* Cloud percentage

The thermal surface temperature band is converted to Celsius.

The implemented conversion is:

```text
LST = ST_B10 × 0.00341802 + 149.0 − 273.15
```

A median LST composite is then generated for the study period.

---

### 5. Heat Hotspot Detection

The application calculates the **90th percentile** of the LST distribution.

```text
Hotspot = LST > 90th percentile
```

This produces a dynamic hotspot layer based on the temperature distribution of the analyzed area.

---

### 6. NDVI–LST Correlation

Because NDVI is available at 10 m while LST is available at 30 m, NDVI is resampled to the LST spatial resolution.

Pearson correlation is then calculated between NDVI and LST.

The application also samples pixels for visualization in the NDVI–LST scatter plot.

---

## 🏗️ System Architecture

```text
                     Satellite Data
                           │
             ┌─────────────┴─────────────┐
             │                           │
        Sentinel-2                  Landsat 8
             │                           │
             ▼                           ▼
           NDVI                         LST
             │                           │
             └─────────────┬─────────────┘
                           │
                           ▼
                  Google Earth Engine
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
       Statistics      Correlation      Hotspots
          │                │                │
          └────────────────┼────────────────┘
                           ▼
                    Next.js API Layer
                           │
                           ▼
                    React WebGIS UI
                           │
                           ▼
                      Leaflet Map
```

---

## 💻 Technology Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* React Leaflet
* SVG-based visualization

### Geospatial Processing

* Google Earth Engine
* Sentinel-2
* Landsat 8
* Remote sensing indices
* Raster statistics
* Spatial resampling

### Mapping

* Leaflet
* OpenStreetMap

### Backend

* Next.js API Routes
* Google Earth Engine REST API
* Google Earth Engine JavaScript/Python-compatible processing concepts

### Deployment

* GitHub
* Vercel

---

## 📁 Project Structure

```text
urban-heat-webgis/
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── earth-engine/
│   │   │       ├── correlation/
│   │   │       ├── hotspot-stats/
│   │   │       ├── hotspots/
│   │   │       ├── lst/
│   │   │       ├── lst-stats/
│   │   │       ├── ndvi/
│   │   │       ├── ndvi-lst-samples/
│   │   │       ├── ndvi-stats/
│   │   │       └── serialize/
│   │   │
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── Map.tsx
│   │   ├── MapWrapper.tsx
│   │   ├── NDVILSTScatterPlot.tsx
│   │   ├── MethodologyPanel.tsx
│   │   └── ...
│   │
│   └── lib/
│       ├── earthEngine.ts
│       └── earthEngineRest.ts
│
├── public/
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/NeerajKumarcodes/delhi-urban-heat-webgis.git
```

```bash
cd delhi-urban-heat-webgis
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Google Earth Engine credentials

For local development, place the Google Earth Engine service-account credentials file in the project root:

```text
earth-engine-key.json
```

The file is intentionally excluded from Git using `.gitignore`.

For production deployment, the application reads the credentials from:

```text
EARTH_ENGINE_SERVICE_ACCOUNT_KEY
```

as a server-side environment variable.

### 4. Start the development server

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

### 5. Production build

```bash
npm run build
```

---

## 🔐 Security

Google Earth Engine service-account credentials are **never committed to the repository**.

The local credential file:

```text
earth-engine-key.json
```

is excluded through `.gitignore`.

Production credentials are supplied through the server-side environment variable:

```text
EARTH_ENGINE_SERVICE_ACCOUNT_KEY
```

The Earth Engine credentials are used by server-side API routes rather than being exposed directly to the browser.

**Never publish the service-account private key in the GitHub repository or frontend code.**

---

## 📊 Example Analytical Outputs

The current 2025 baseline analysis produces dynamically calculated values such as:

* Mean NDVI
* Minimum and maximum NDVI
* Mean LST
* Minimum and maximum LST
* NDVI–LST Pearson correlation
* 90th-percentile LST hotspot threshold
* Hotspot area
* Hotspot percentage

These values are calculated from the Earth Engine datasets rather than being hard-coded into the interface.

---

## 🔬 Scientific Interpretation

The WebGIS demonstrates how remotely sensed vegetation and surface-temperature datasets can be integrated for urban environmental analysis.

In general, vegetation can influence surface thermal conditions through processes such as evapotranspiration and shading. However, the relationship observed in this application is a statistical relationship within the selected study period and should not be interpreted as a direct causal estimate.

Other factors such as:

* Built-up density
* Land-cover type
* Soil moisture
* Water bodies
* Atmospheric conditions
* Urban morphology
* Anthropogenic heat

can also influence land surface temperature.

---

## 🔮 Future Enhancements

Potential future improvements include:

* Multi-year NDVI and LST comparison
* Seasonal analysis
* Automated temporal charts
* Land-use/land-cover integration
* Built-up index analysis
* Population exposure analysis
* Ward-level statistics
* Heat vulnerability mapping
* Time-series animation
* Downloadable analytical reports
* Additional satellite datasets
* Advanced spatial statistics
* Historical hotspot comparison

---

## 📚 Learning & Application Areas

This project demonstrates practical integration of:

* Remote Sensing
* GIS
* WebGIS
* Google Earth Engine
* Satellite image processing
* NDVI analysis
* Land Surface Temperature analysis
* Spatial statistics
* Environmental monitoring
* Full-stack web development

---

## 👨‍💻 Author

**Neeraj Kumar**

M.Tech Geoinformatics
Delhi Technological University

B.Tech Metallurgical and Materials Engineering
NIT Rourkela

### Areas of Interest

* Geoinformatics
* Remote Sensing
* GIS & WebGIS
* Earth Observation
* Geospatial Data Analysis
* Full-Stack Development
* AI & Geospatial Applications

---

## ⭐ Project

If you find this project useful for learning about Remote Sensing, GIS, WebGIS, or Earth Engine, consider giving the repository a ⭐.

**Live Demo:**
https://delhi-urban-heat-webgis.vercel.app/

**Repository:**
https://github.com/NeerajKumarcodes/delhi-urban-heat-webgis
