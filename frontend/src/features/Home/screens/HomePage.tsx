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
import CoursesSection, { type CourseItem } from "../sections/CoursesSection";
import TestimonialsSection from "../sections/TestimonialsSection";
import NewsSection from "../sections/NewsSection";
import {
  dashboardService,
  type DashboardSummaryResponse,
} from "../../../services/dashboardService";

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const [summary, setSummary] = useState<DashboardSummaryResponse | undefined>();
  const [activeCourses, setActiveCourses] = useState<ActiveStudentCourse[] | undefined>();
  const [catalogCourses, setCatalogCourses] = useState<CourseItem[] | undefined>();
console.log("islogedIn",isLoggedIn)
  useEffect(() => {
    console.log("islogedInsvdeeveve", isLoggedIn);
    dashboardService
      .getCoursesCatalog()
      .then((data) => setCatalogCourses(data))
      .catch((err) => console.error("Error fetching catalog courses:", err));

    if (isLoggedIn) {
      dashboardService
        .getSummary()
        .then((data) => setSummary(data))
        .catch((err) => console.error("Error fetching summary:", err));

      dashboardService
        .getActiveCourses()
        .then((data) => setActiveCourses(data))
        .catch((err) => console.error("Error fetching active courses:", err));
    }
  }, [isLoggedIn]);

  return (
    <>
      {/* Dynamic Hero — adapts based on auth state */}
      {isLoggedIn ? <LoggedInHero summary={summary} /> : <HeroSection />}

      {/* Logged-In: personal dashboard widgets */}
      {isLoggedIn && <UserDashboardWidgets activeCourses={activeCourses} />}

      {/* Guest-only: overview & marketing sections */}
      {!isLoggedIn && (
        <>
          <StatsSection />
          <CloudSoftwareSection />
          <AboutSection />
        </>
      )}

      {/* Shared sections */}
      <FeaturesSection />
      <CoursesSection courses={catalogCourses} />

      {/* Guest-only: news */}
      {!isLoggedIn && <NewsSection />}

      <TestimonialsSection />
    </>
  );
}
