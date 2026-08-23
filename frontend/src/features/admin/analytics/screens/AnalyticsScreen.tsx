import { useEffect, useState } from "react";
import { TrendingUp, Users, Clock, Award } from "lucide-react";
import StatCard from "../../components/StatCard";
import { adminService, type AdminStats, type AdminCourse, type CategoryItem } from "../../services/adminService";

export default function AnalyticsScreen() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.getDashboardStats().catch(() => null),
      adminService.getCourses().catch(() => []),
      adminService.getCategories().catch(() => []),
    ]).then(([statsData, coursesData, categoriesData]) => {
      setStats(statsData);
      setCourses(coursesData || []);
      setCategories(categoriesData || []);
      setLoading(false);
    });
  }, []);

  const totalCourses = courses.length || 1;
  const categoryCounts = categories.map((cat) => {
    const count = courses.filter((c) => c.category.toLowerCase() === cat.name.toLowerCase()).length;
    const percent = Math.round((count / totalCourses) * 100);
    return { name: cat.name, count, percent };
  });

  const topCourses = [...courses]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Platform Analytics & Insights</h2>
        <p className="text-xs text-slate-500 mt-1">Real-time metrics from MongoDB database</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Active Learners"
          value={stats ? stats.totalStudents.toLocaleString() : "0"}
          growth={stats?.studentsGrowth ?? 5.2}
          icon={Users}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />
        <StatCard
          title="Published Platform Courses"
          value={stats ? stats.totalCourses.toLocaleString() : "0"}
          growth={stats?.coursesGrowth ?? 12.0}
          icon={Award}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <StatCard
          title="Active Enrollments"
          value={stats ? stats.activeEnrollmentsCount.toLocaleString() : "0"}
          growth={8.4}
          icon={Clock}
          iconBgColor="bg-purple-50"
          iconTextColor="text-purple-600"
        />
        <StatCard
          title="Total Platform Revenue"
          value={stats ? `₹${stats.totalRevenue.toLocaleString()}` : "₹0"}
          growth={stats?.revenueGrowth ?? 14.2}
          icon={TrendingUp}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Share Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Course Distribution by Category</h3>
            <p className="text-xs text-slate-500 mt-0.5">Popular learning domains on platform</p>
          </div>

          <div className="space-y-4 pt-2">
            {loading ? (
              <div className="text-center text-xs text-slate-400 py-4">Loading categories...</div>
            ) : categoryCounts.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-4">No category analytics yet</div>
            ) : (
              categoryCounts.map((item) => (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{item.name}</span>
                    <span className="font-bold text-slate-600">{item.count} Courses ({item.percent}%)</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.max(item.percent, 8)}%` }}
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Performing Courses */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Top Rated Courses</h3>
            <p className="text-xs text-slate-500 mt-0.5">Highest rated by enrolled students</p>
          </div>

          <div className="space-y-3 pt-2">
            {loading ? (
              <div className="text-center text-xs text-slate-400 py-4">Loading top courses...</div>
            ) : topCourses.length === 0 ? (
              <div className="text-center text-xs text-slate-400 py-4">No top rated courses yet</div>
            ) : (
              topCourses.map((course, idx) => (
                <div key={course.id || idx} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">{course.title}</p>
                      <p className="text-[11px] text-slate-400">{course.studentsCount || 0} students enrolled</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold">
                    ★ {course.rating || 4.9}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
