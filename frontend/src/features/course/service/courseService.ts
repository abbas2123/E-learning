import apiClint from "../../../services/apiClient";

import type {
  Course,
  CourseSection,
  Lesson,
  LessonNote,
  LessonResource,
} from "../types/course.types";

export const getCourses = async (): Promise<Course[]> => {
  const response = await apiClint.get("/course");
  return response.data.data;
};
export const getCoursesId = async (courseId: string): Promise<Course> => {
  const response = await apiClint.get(`/courses/${courseId}`);
  return response.data.data;
};
export const getCourseCurriculum = async (
  courseId: string,
): Promise<CourseSection[]> => {
  const response = await apiClint.get(`/courses/${courseId}/curriculum`);

  return response.data.data;
};

export const getLessonById = async (lessonId: string): Promise<Lesson> => {
  const response = await apiClint.get(`/lessons/${lessonId}`);

  return response.data.data;
};

export const getLessonNotes = async (
  lessonId: string,
): Promise<LessonNote[]> => {
  const response = await apiClint.get(`/lessons/${lessonId}/notes`);

  return response.data.data;
};

export const getLessonResources = async (
  lessonId: string,
): Promise<LessonResource[]> => {
  const response = await apiClint.get(`/lessons/${lessonId}/resources`);

  return response.data.data;
};
export const enrollCourse = async (courseId: string) => {
  const response = await apiClint.post(`/courses/${courseId}/enroll`);

  return response.data;
};
export const getMyCourses = async (): Promise<Course[]> => {
  const response = await apiClint.get("/courses/my-courses");

  return response.data.data;
};
