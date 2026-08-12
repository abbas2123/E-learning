export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  enrolledCount: number;
  activeCourses: number;
  gpa: string;
  authProvider: "local" | "google";
};
