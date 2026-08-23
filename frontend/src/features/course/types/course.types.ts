export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  language: string;
  duration: number;
  lessonsCount: number;
  price: number;
  discountPrice?: number;
  status: "draft" | "published" | "archived";
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseSection {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order?: number;
  position: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  sectionId: string;
  title: string;
  description?: string;
  type: "video" | "text" | "quiz" | "assignment";
  videoUrl?: string;
  duration: number;
  order?: number;
  position: number;
  isPreview: boolean;
  resources?: LessonResource[];
}

export interface LessonNote {
  id: string;
  lessonId: string;
  title: string;
  content: string;
  order?: number;
  position: number;
}

export interface LessonResource {
  id: string;
  lessonId: string;
  title: string;
  type: string;
  url: string;
}
