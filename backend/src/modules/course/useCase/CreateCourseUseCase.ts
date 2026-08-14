import { Course } from "../entity/Course";
import type { ICourseRepository } from "../interface/ICourseRepository";

interface CreateCourseInput {
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
  requirements?: string[];
  learningOutcomes?: string[];
  createdBy: string;
}

export class CreateCourseUseCase {
  constructor(private readonly courseRepository: ICourseRepository) {}

  async execute(input: CreateCourseInput): Promise<Course> {
    const existingCourse = await this.courseRepository.findBySlug(input.slug);

    if (existingCourse) {
      throw new Error("A course with this slug already exists.");
    }

    if (
      input.discountPrice !== undefined &&
      input.discountPrice >= input.price
    ) {
      throw new Error("Discount price must be lower than the original price.");
    }

    const course = Course.create({
      id: crypto.randomUUID(),

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

      status: "draft",

      createdBy: input.createdBy,

      requirements: input.requirements ?? [],

      learningOutcomes: input.learningOutcomes ?? [],

      createdAt: new Date(),

      updatedAt: new Date(),
    });

    return this.courseRepository.create(course);
  }
}
