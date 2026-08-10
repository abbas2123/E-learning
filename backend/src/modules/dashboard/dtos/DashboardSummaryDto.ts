export type DashboardSummaryDto = {
  enrolledCount: number;
  activeCount: number;
  userGpa: string;
  nextClass?: {
    title: string;
    instructor: string;
    room: string;
    startTime: string;
    avatar?: string;
  };
};
