import { Course } from "../entity/Course";

export interface ICourseRepository {
  create(course: Course): Promise<Course>;
  findById(id: string): Promise<Course | null>;
  findBySlug(slug: string): Promise<Course | null>;
  findAll(): Promise<Course[]>;
  update(course: Course): Promise<Course>;
  delete(id: string): Promise<void>;
}
