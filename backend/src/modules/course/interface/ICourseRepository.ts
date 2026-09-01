import { Course } from "../entity/Course";

export interface CourseFilterParams {
  category?: string;
  search?: string;
  status?: string;
}

export interface CourseSummaryDto {
  id: string;
  title: string;
  createdBy: string;
  status: string;
  minCertificateScore: number;
}

export interface ICourseRepository {
  create(course: Course): Promise<Course>;
  findById(id: string): Promise<Course | null>;
  findSummaryById(id: string): Promise<CourseSummaryDto | null>;
  findBySlug(slug: string): Promise<Course | null>;
  findAll(filter?: CourseFilterParams): Promise<Course[]>;
  update(course: Course): Promise<Course>;
  delete(id: string): Promise<void>;
}
