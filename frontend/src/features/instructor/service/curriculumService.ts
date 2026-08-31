import apiClient from "../../../services/apiClient";
import type { CourseSection, Lesson } from "../../course/types/course.types";

export const createSection = async (
  courseId: string,
  title: string,
  description?: string,
): Promise<CourseSection> => {
  const response = await apiClient.post(`/api/courses/${courseId}/sections`, {
    title,
    description,
  });
  return response.data.data;
};

export const updateSection = async (
  sectionId: string,
  title?: string,
  description?: string,
): Promise<CourseSection> => {
  const response = await apiClient.put(`/api/sections/${sectionId}`, {
    title,
    description,
  });
  return response.data.data;
};

export const deleteSection = async (sectionId: string): Promise<void> => {
  await apiClient.delete(`/api/sections/${sectionId}`);
};

export const reorderSections = async (
  courseId: string,
  orderedSectionIds: string[],
): Promise<CourseSection[]> => {
  const response = await apiClient.patch(`/api/courses/${courseId}/sections/reorder`, {
    orderedSectionIds,
  });
  return response.data.data;
};

export interface CreateLessonPayload {
  title: string;
  description?: string;
  type?: "video" | "text" | "quiz" | "assignment";
  videoUrl?: string;
  videoSourceType?: "uploaded" | "youtube" | "vimeo" | "external" | "hls";
  quizId?: string;
  duration?: number;
  isPreview?: boolean;
}

export const createLesson = async (
  sectionId: string,
  payload: CreateLessonPayload,
): Promise<Lesson> => {
  const response = await apiClient.post(`/api/sections/${sectionId}/lessons`, payload);
  return response.data.data;
};

export const updateLesson = async (
  lessonId: string,
  payload: Partial<CreateLessonPayload>,
): Promise<Lesson> => {
  const response = await apiClient.put(`/api/lessons/${lessonId}`, payload);
  return response.data.data;
};

export const deleteLesson = async (lessonId: string): Promise<void> => {
  await apiClient.delete(`/api/lessons/${lessonId}`);
};

export const reorderLessons = async (
  sectionId: string,
  orderedLessonIds: string[],
): Promise<Lesson[]> => {
  const response = await apiClient.patch(`/api/sections/${sectionId}/lessons/reorder`, {
    orderedLessonIds,
  });
  return response.data.data;
};

export const uploadVideoFile = async (
  file: File,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<{ url: string; duration?: number }> => {
  const formData = new FormData();
  formData.append("video", file);

  const response = await apiClient.post("/api/instructor/upload-video", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    signal,
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percent);
      }
    },
  });

  return response.data.data;
};

const curriculumService = {
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  uploadVideoFile,
};

export default curriculumService;
