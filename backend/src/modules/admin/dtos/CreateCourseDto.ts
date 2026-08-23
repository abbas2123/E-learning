export interface CreateCourseDto {
  title: string;
  category: string;
  description: string;
  price: number;
  level?: "beginner" | "intermediate" | "advanced";
  thumbnail?: string;
  status?: "published" | "draft" | "pending";
}
