export type AdminCourseDto = {
  id: string;
  title: string;
  category?: string;
  instructor?: string;
  price?: number;
  studentsCount?: number;
  rating?: number;
  status: string;
  level?: string;
  thumbnail?: string;
  createdAt?: string | Date;
};
