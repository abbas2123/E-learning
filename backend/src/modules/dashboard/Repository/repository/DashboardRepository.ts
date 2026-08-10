import type {
  IDashboardRepository,
  DashboardSummary,
  ActiveCourse,
  CatalogCourse,
} from "../../interface/IDashboardRepository";
import { UserModel } from "../../../auth/Repository/database/User";

export class DashboardRepository implements IDashboardRepository {
  async getSummaryByUserId(userId: string): Promise<DashboardSummary> {
    const userDoc = await UserModel.findOne({ id: userId });
    return {
      enrolledCount: 4,
      activeCount: 3,
      userGpa: "3.92",
      nextClass: {
        title: "Advanced Full-Stack Engineering",
        instructor: "Dr. Sarah Jenkins",
        room: "#classroom-live-4",
        startTime: "Today 2:00 PM",
        avatar:
          "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      },
    };
  }

  async getActiveCoursesByUserId(userId: string): Promise<ActiveCourse[]> {
    const userDoc = await UserModel.findOne({ id: userId });
    if (!userDoc) return [];

    return [
      {
        id: "c1",
        title: "Advanced Full-Stack Engineering",
        category: "Development",
        progress: 75,
        modulesCompleted: "12 / 16 Modules",
        instructor: "Dr. Sarah Jenkins",
        image:
          "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80",
        nextLesson: "Building RESTful microservices with Node.js",
      },
      {
        id: "c2",
        title: "UI/UX Design Systems & Micro-Interactions",
        category: "Design",
        progress: 50,
        modulesCompleted: "8 / 16 Modules",
        instructor: "Marcus Vance",
        image:
          "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80",
        nextLesson: "Figma Tokens & Design System Components",
      },
    ];
  }

  async getCoursesCatalog(): Promise<CatalogCourse[]> {
    return [
      {
        id: "c1",
        title: "User Experience Design",
        description:
          "Design interfaces and experiences that delight customers.",
        label: "Beginner Friendly",
        accent: "bg-rose-500/10 text-rose-600 border-rose-200",
      },
      {
        id: "c2",
        title: "Full Stack Development",
        description:
          "Build modern web apps with React, Node and cloud-ready tooling.",
        label: "Career Track",
        accent: "bg-cyan-500/10 text-cyan-600 border-cyan-200",
      },
      {
        id: "c3",
        title: "Data Science Fundamentals",
        description:
          "Learn analytics, visualization, and applied machine learning.",
        label: "Fast Track",
        accent: "bg-violet-500/10 text-violet-600 border-violet-200",
      },
    ];
  }
}
