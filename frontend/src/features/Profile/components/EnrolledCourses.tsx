import { useEffect, useState } from "react";
import CourseCard from "./CourseCard";
import { dashboardService } from "../../../services/dashboardService";
import type { ActiveStudentCourse } from "../../Home/components/UserDashboardWidgets";
import { Skeleton } from "../../../components/ui/Skeleton";
import { EmptyState } from "../../../components/ui/EmptyState";
import { BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EnrolledCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<ActiveStudentCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEnrolled() {
      try {
        const data = await dashboardService.getActiveCourses();
        setCourses(data || []);
      } catch (err) {
        console.error("Failed to fetch enrolled courses", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEnrolled();
  }, []);

  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Enrolled Courses</h2>
        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
          {courses.length} Active
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No enrolled courses yet"
          description="Browse our course catalog and enroll in courses to start learning."
          actionLabel="Explore Catalog"
          onAction={() => navigate("/course")}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={{
                id: course.id,
                category: course.category,
                title: course.title,
                description: `Next Lesson: ${course.nextLesson}`,
                image: course.image,
                progress: course.progress,
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
