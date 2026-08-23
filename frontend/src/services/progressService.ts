import apiClient from "./apiClient";

export interface LessonProgressData {
  lessonId: string;
  completed: boolean;
  watchedSeconds: number;
  completedAt: string | null;
}

export interface CourseProgressSummaryData {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  completed: boolean;
  lessons: {
    lessonId: string;
    completed: boolean;
    watchedSeconds: number;
    completedAt: string | null;
  }[];
}

export const progressService = {
  async getCourseProgress(courseId: string): Promise<CourseProgressSummaryData> {
    const res = await apiClient.get<{ success: boolean; data: CourseProgressSummaryData }>(
      `/api/courses/${courseId}/progress`,
    );
    return res.data.data;
  },

  async getLessonProgress(
    courseId: string,
    lessonId: string,
  ): Promise<LessonProgressData> {
    const res = await apiClient.get<{ success: boolean; data: LessonProgressData }>(
      `/api/courses/${courseId}/lessons/${lessonId}/progress`,
    );
    return res.data.data;
  },

  async updateLessonProgress(
    courseId: string,
    lessonId: string,
    watchedSeconds: number,
  ): Promise<LessonProgressData> {
    const res = await apiClient.patch<{ success: boolean; data: LessonProgressData }>(
      `/api/courses/${courseId}/lessons/${lessonId}/progress`,
      { watchedSeconds },
    );
    return res.data.data;
  },

  async markLessonComplete(
    courseId: string,
    lessonId: string,
    watchedSeconds?: number,
  ): Promise<LessonProgressData> {
    const res = await apiClient.post<{ success: boolean; data: LessonProgressData }>(
      `/api/courses/${courseId}/lessons/${lessonId}/complete`,
      { watchedSeconds },
    );
    return res.data.data;
  },
};

export default progressService;
