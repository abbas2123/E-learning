import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import HeroSection from "../sections/HeroSection";
import LoggedInHero from "../components/LoggedInHero";
import UserDashboardWidgets, {
  type ActiveStudentCourse,
} from "../components/UserDashboardWidgets";
import StatsSection from "../sections/StatsSection";
import AboutSection from "../sections/AboutSection";
import CloudSoftwareSection from "../sections/CloudSoftwareSection";
import FeaturesSection from "../sections/FeaturesSection";
import CategoriesSection from "../sections/CategoriesSection";
import CoursesSection, { type CourseItem } from "../sections/CoursesSection";
import TestimonialsSection from "../sections/TestimonialsSection";
import NewsSection from "../sections/NewsSection";
import {
  dashboardService,
  type DashboardSummaryResponse,
} from "../../../services/dashboardService";

import { Navigate } from "react-router-dom";

export default function HomePage() {
  const { isLoggedIn, user } = useAuth();

  // Instructors and Admins should go straight to their dedicated dashboards
  if (isLoggedIn) {
    if (user?.role === "instructor") {
      return <Navigate to="/instructor/dashboard" replace />;
    }
    if (user?.role === "admin") {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }

  const [summary, setSummary] = useState<DashboardSummaryResponse | undefined>();
  const [activeCourses, setActiveCourses] = useState<ActiveStudentCourse[] | undefined>();
  const [catalogCourses, setCatalogCourses] = useState<CourseItem[] | undefined>();
  const [dashboardLoading, setDashboardLoading] = useState(false);

  useEffect(() => {
    dashboardService
      .getCoursesCatalog()
      .then((data) => setCatalogCourses(data))
      .catch((err) => console.error("Error fetching catalog courses:", err));

    if (isLoggedIn) {
      setDashboardLoading(true);
      Promise.all([
        dashboardService.getSummary().then(setSummary),
        dashboardService.getActiveCourses().then(setActiveCourses),
      ])
        .catch((err) => console.error("Error fetching student dashboard:", err))
        .finally(() => setDashboardLoading(false));
    } else {
      setSummary(undefined);
      setActiveCourses(undefined);
      setDashboardLoading(false);
    }
  }, [isLoggedIn]);

  return (
    <>
      {/* Dynamic Hero */}
      {isLoggedIn ? (
        <LoggedInHero summary={summary} loading={dashboardLoading} />
      ) : (
        <HeroSection />
      )}

      {/* Logged-In Student Dashboard */}
      {isLoggedIn && (
        <UserDashboardWidgets
          activeCourses={activeCourses}
          loading={dashboardLoading}
        />
      )}

      {/* Popular Categories from DB */}
      <CategoriesSection />

      {/* Featured Courses Catalog */}
      <CoursesSection courses={catalogCourses} />

      {/* Guest-only sections */}
      {!isLoggedIn && (
        <>
          <StatsSection />
          <CloudSoftwareSection />
          <AboutSection />
          <FeaturesSection />
          <NewsSection />
        </>
      )}

      {/* Reviews & Testimonials */}
      <TestimonialsSection />
    </>
  );
}
