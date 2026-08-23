export interface LessonProgressDto {
  id: string;
  studentId: string;
  courseId: string;
  lessonId: string;
  completed: boolean;
  watchedSeconds: number;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseProgressSummaryDto {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  completed: boolean;
  lessons: {
    lessonId: string;
    completed: boolean;
    watchedSeconds: number;
    completedAt: Date | null;
  }[];
}

export interface UpsertProgressParams {
  studentId: string;
  courseId: string;
  lessonId: string;
  completed?: boolean;
  watchedSeconds?: number;
  completedAt?: Date | null;
}

export interface ILessonProgressRepository {
  upsertProgress(params: UpsertProgressParams): Promise<LessonProgressDto>;
  findByLesson(
    studentId: string,
    courseId: string,
    lessonId: string,
  ): Promise<LessonProgressDto | null>;
  findByCourse(
    studentId: string,
    courseId: string,
  ): Promise<LessonProgressDto[]>;
  countCompletedLessons(studentId: string, courseId: string): Promise<number>;
}
