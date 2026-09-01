export interface ResumeCourseDto {
  courseId: string;
  courseTitle: string;
  lessonId?: string;
  lessonTitle?: string;
  progressPercentage: number;
  thumbnail?: string;
}

export type DashboardSummaryDto = {
  enrolledCount: number;
  activeCount: number;
  completedCount: number;
  certificatesCount: number;
  resumeCourse?: ResumeCourseDto | null;
  nextClass?: {
    title: string;
    instructor: string;
    room: string;
    startTime: string;
    avatar?: string;
  } | null;
};
