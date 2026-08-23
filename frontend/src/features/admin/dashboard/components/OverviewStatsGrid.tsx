import { DollarSign, Users, GraduationCap, BookOpen } from "lucide-react";
import StatCard from "../../components/StatCard";
import type { AdminStats } from "../../services/adminService";

interface OverviewStatsGridProps {
  stats: AdminStats;
}

export default function OverviewStatsGrid({ stats }: OverviewStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <StatCard
        title="Total Platform Revenue"
        value={`₹${stats.totalRevenue.toLocaleString()}`}
        growth={stats.revenueGrowth}
        icon={DollarSign}
        iconBgColor="bg-emerald-50"
        iconTextColor="text-emerald-600"
      />

      <StatCard
        title="Active Enrolled Students"
        value={stats.totalStudents.toLocaleString()}
        growth={stats.studentsGrowth}
        icon={Users}
        iconBgColor="bg-blue-50"
        iconTextColor="text-blue-600"
      />

      <StatCard
        title="Verified Instructors"
        value={stats.totalInstructors.toLocaleString()}
        growth={stats.instructorsGrowth}
        icon={GraduationCap}
        iconBgColor="bg-purple-50"
        iconTextColor="text-purple-600"
      />

      <StatCard
        title="Published Courses"
        value={stats.totalCourses.toLocaleString()}
        growth={stats.coursesGrowth}
        icon={BookOpen}
        iconBgColor="bg-amber-50"
        iconTextColor="text-amber-600"
      />
    </div>
  );
}
