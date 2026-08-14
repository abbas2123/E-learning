import type { ICourseRepository } from "../interface/ICourseRepository";
import { Course } from "../entity/Course";

interface UpdateCourseInput {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  language?: string;
  price: number;
  discountPrice?: number;
  duration: number;
  status: "draft" | "published" | "archived";
  requirements?: string[];
  learningOutcomes?: string[];
}

export class UpdateCourseUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute(input: UpdateCourseInput): Promise<Course> {
    const existingCourse = await this.courseRepository.findById(input.id);

    if (!existingCourse) {
      throw new Error("Course not found.");
    }

    const courseWithSlug = await this.courseRepository.findBySlug(input.slug);

    if (courseWithSlug && courseWithSlug.id !== input.id) {
      throw new Error("A course with this slug already exists.");
    }

    if (
      input.discountPrice !== undefined &&
      input.discountPrice >= input.price
    ) {
      throw new Error("Discount price must be lower than the original price.");
    }

    const updatedCourse = Course.reconstruct({
      id: existingCourse.id,

      title: input.title,

      slug: input.slug,

      description: input.description,

      thumbnail: input.thumbnail ?? "",

      category: input.category,

      level: input.level,

      language: input.language ?? "English",

      price: input.price,

      discountPrice: input.discountPrice,

      duration: input.duration,

      status: input.status,

      createdBy: existingCourse.createdBy,

      requirements: input.requirements ?? [],

      learningOutcomes: input.learningOutcomes ?? [],

      createdAt: existingCourse.createdAt,

      updatedAt: new Date(),
    });

    return this.courseRepository.update(updatedCourse);
  }
}
