import WebGISDashboard from "@/components/WebGISDashboard";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">
              Urban Heat & Green Cover Monitoring
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Delhi, India · Remote Sensing & WebGIS
            </p>
          </div>

          <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-300">
            2025
          </div>
        </div>
      </header>

      {/* Main application */}
      <WebGISDashboard />
    </main>
  );
}