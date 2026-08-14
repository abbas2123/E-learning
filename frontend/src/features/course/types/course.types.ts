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
  createdAt: string;
  updatedAt: string;
}

export interface CourseSection {
  id: string;
  courseId: string;
  title: string;
  description?: string;
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
  position: number;
  isPreview: boolean;
}

export interface LessonNote {
  id: string;
  lessonId: string;
  title: string;
  content: string;
  position: number;
}

export interface LessonResource {
  id: string;
  lessonId: string;
  title: string;
  type: string;
  url: string;
}
