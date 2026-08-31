import type { LessonDto, LessonResourceDto } from "./ISectionRepository";

export interface CreateLessonParams {
  sectionId: string;
  courseId: string;
  title: string;
  description?: string;
  type?: "video" | "text" | "quiz" | "assignment";
  videoUrl?: string;
  videoSourceType?: "uploaded" | "youtube" | "vimeo" | "external" | "hls";
  quizId?: string;
  duration?: number;
  order?: number;
  isPreview?: boolean;
  resources?: LessonResourceDto[];
}

export interface UpdateLessonParams {
  title?: string;
  description?: string;
  type?: "video" | "text" | "quiz" | "assignment";
  videoUrl?: string;
  videoSourceType?: "uploaded" | "youtube" | "vimeo" | "external" | "hls";
  quizId?: string;
  duration?: number;
  order?: number;
  isPreview?: boolean;
  resources?: LessonResourceDto[];
}

export interface ILessonRepository {
  createLesson(params: CreateLessonParams): Promise<LessonDto>;
  updateLesson(lessonId: string, params: UpdateLessonParams): Promise<LessonDto | null>;
  deleteLesson(lessonId: string): Promise<boolean>;
  deleteLessonsBySectionId(sectionId: string): Promise<number>;
  findById(lessonId: string): Promise<LessonDto | null>;
  findBySectionId(sectionId: string): Promise<LessonDto[]>;
  findByCourseId(courseId: string): Promise<LessonDto[]>;
  findByQuizOrLessonId(courseId: string, quizId: string, lessonId?: string): Promise<LessonDto | null>;
  reorderLessons(sectionId: string, orderedLessonIds: string[]): Promise<LessonDto[]>;
  getMaxOrder(sectionId: string): Promise<number>;
}
