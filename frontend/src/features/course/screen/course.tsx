import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CourseCard, { type Course } from "../components/CourseCard";

import CourseHeader from "../components/CourseHeader";
import CourseFilter from "../components/CourseFilter";

const courses: Course[] = [
  {
    id: "1",
    title: "Full Stack MERN Development",
    description:
      "Learn to build modern full-stack applications using React, Node.js, Express and MongoDB.",
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    category: "Web Development",
    level: "Intermediate",
    duration: 42,
    lessons: 86,
    price: 2999,
    originalPrice: 4999,
  },
  {
    id: "2",
    title: "React.js Complete Guide",
    description:
      "Learn React from fundamentals to advanced concepts and build real-world applications.",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
    category: "Frontend",
    level: "Intermediate",
    duration: 28,
    lessons: 54,
    price: 1999,
    originalPrice: 3499,
  },
  {
    id: "3",
    title: "Node.js Backend Development",
    description:
      "Build scalable REST APIs and backend applications using Node.js and Express.",
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31",
    category: "Backend",
    level: "Advanced",
    duration: 31,
    lessons: 63,
    price: 2499,
    originalPrice: 3999,
  },
  {
    id: "4",
    title: "JavaScript Fundamentals",
    description:
      "Master JavaScript fundamentals and develop a strong foundation for modern web development.",
    thumbnail: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55",
    category: "Programming",
    level: "Beginner",
    duration: 18,
    lessons: 36,
    price: 1499,
    originalPrice: 2499,
  },
];

const CourseScreen = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.description.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || course.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const handleCourseClick = (course: Course) => {
    navigate(`/course/${course.id}`);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <CourseHeader search={search} onSearchChange={setSearch} />

        <CourseFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Course count */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">All Courses</h2>

          <p className="text-sm text-slate-500">
            {filteredCourses.length} courses
          </p>
        </div>

        {/* Courses */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={handleCourseClick}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-64 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white">
            <div className="text-center">
              <h3 className="font-semibold text-slate-900">No courses found</h3>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or category.
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default CourseScreen;
