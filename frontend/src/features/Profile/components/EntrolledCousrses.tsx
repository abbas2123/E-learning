import CourseCard from "./CourseCard";
import { courses } from "../data/profileData";

export default function EnrolledCourses() {
  return (
    <section>
      {/* Heading */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold text-[#252a43]">Enrolled Courses</h2>

        <button
          type="button"
          className="text-[8px] font-semibold text-[#53C4C8] transition hover:text-[#3faeb2]"
        >
          View All Courses
        </button>
      </div>

      {/* Courses */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
}
