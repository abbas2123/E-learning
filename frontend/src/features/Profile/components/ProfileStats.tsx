import { useEffect, useState } from "react";
import { dashboardService, type DashboardSummaryResponse } from "../../../services/dashboardService";

export default function ProfileStats() {
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);

  useEffect(() => {
    dashboardService
      .getSummary()
      .then((data) => setSummary(data))
      .catch((err) => console.error("Failed to load profile stats summary", err));
  }, []);

  const enrolledCount = summary?.enrolledCount ?? 0;
  const activeCount = summary?.activeCount ?? 0;

  return (
    <div className="flex items-center gap-5 sm:gap-7">
      <Stat value={String(enrolledCount)} label="Enrolled" color="text-[#53C4C8]" />
      <Divider />
      <Stat value={String(activeCount)} label="Active" color="text-[#53C4C8]" />
      <Divider />
      <Stat value={String(enrolledCount > 0 ? enrolledCount : 0)} label="Certificates" color="text-orange-500" />
    </div>
  );
}

interface StatProps {
  value: string;
  label: string;
  color: string;
}

function Stat({ value, label, color }: StatProps) {
  return (
    <div className="min-w-[45px] text-center">
      <p className={`text-sm font-bold ${color}`}>{value}</p>
      <p className="mt-0.5 text-[8px] text-gray-400">{label}</p>
    </div>
  );
}

function Divider() {
  return <div className="h-8 w-px bg-gray-200" />;
}
