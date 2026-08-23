import { ArrowUpRight } from "lucide-react";

export default function PlatformPerformanceChart() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"];
  const revenueHeights = [40, 55, 62, 78, 85, 92, 105, 128]; // in thousands
  const maxVal = 140;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Revenue Growth Trend</h3>
            <p className="text-xs text-slate-500 mt-0.5">Monthly revenue trajectory ($ USD)</p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            <span>+18.4% YoY</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* SVG Bar / Area Visualization */}
      <div className="mt-8">
        <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 px-2">
          {revenueHeights.map((val, idx) => {
            const heightPercent = Math.round((val / maxVal) * 100);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                {/* Tooltip */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md pointer-events-none whitespace-nowrap z-10">
                  ${val}k
                </div>
                <div className="w-full bg-slate-100 rounded-t-xl overflow-hidden h-full flex items-end">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:from-blue-500 group-hover:to-indigo-400 transition-all rounded-t-xl"
                  />
                </div>
                <span className="text-[11px] font-medium text-slate-400">{months[idx]}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="font-medium">Total 2026 Projected: <strong className="text-slate-900">$1.54M</strong></span>
        <span className="text-blue-600 font-semibold cursor-pointer hover:underline">View Full Financial Report</span>
      </div>
    </div>
  );
}
