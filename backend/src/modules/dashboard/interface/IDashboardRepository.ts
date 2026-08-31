export interface ActiveCourse {
  id: string;
  title: string;
  category: string;
  progress: number;
  modulesCompleted: string;
  instructor: string;
  image: string;
  nextLesson: string;
  lastLessonId?: string;
}

export interface CatalogCourse {
  id: string;
  title: string;
  description: string;
  label?: string;
  accent?: string;
}

export interface ResumeCourseInfo {
  courseId: string;
  courseTitle: string;
  lessonId?: string;
  lessonTitle?: string;
  progressPercentage: number;
  thumbnail?: string;
}

export interface DashboardSummary {
  enrolledCount: number;
  activeCount: number;
  completedCount: number;
  certificatesCount: number;
  resumeCourse?: ResumeCourseInfo | null;
  nextClass?: {
    title: string;
    instructor: string;
    room: string;
    startTime: string;
    avatar?: string;
  } | null;
}

export interface IDashboardRepository {
  getSummaryByUserId(userId: string): Promise<DashboardSummary>;
  getActiveCoursesByUserId(userId: string): Promise<ActiveCourse[]>;
  getCoursesCatalog(): Promise<CatalogCourse[]>;
  enrollCourse(userId: string, courseId: string): Promise<void>;
}
