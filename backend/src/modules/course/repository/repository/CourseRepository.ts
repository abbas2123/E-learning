import { ICourseRepository, CourseSummaryDto } from "../../interface/ICourseRepository";
import { CourseModel } from "../database/Course";
import { Course } from "../../entity/Course";

export class CourseRepository implements ICourseRepository {
  private toEntity(document: typeof CourseModel.prototype): Course {
    return Course.reconstruct({
      id: document.id ?? document._id.toString(),

      title: document.title,

      slug: document.slug,

      description: document.description,

      thumbnail: document.thumbnail ?? "",

      category: document.category,

      level: document.level,

      language: document.language,

      price: document.price,

      discountPrice: document.discountPrice ?? undefined,

      duration: document.duration,

      status: document.status,

      createdBy: document.createdBy,

      requirements: document.requirements ?? [],

      learningOutcomes: document.learningOutcomes ?? [],

      createdAt: document.createdAt,

      updatedAt: document.updatedAt,
    });
  }

  async create(course: Course): Promise<Course> {
    const doc = new CourseModel({
      id: course.id,

      title: course.title,

      slug: course.slug,

      description: course.description,

      thumbnail: course.thumbnail || null,

      category: course.category,

      level: course.level,

      language: course.language,

      price: course.price,

      discountPrice: course.discountPrice ?? null,

      duration: course.duration,

      status: course.status,

      createdBy: course.createdBy,

      requirements: course.requirements,

      learningOutcomes: course.learningOutcomes,
    });

    const saved = await doc.save();

    return this.toEntity(saved);
  }

  async findById(id: string): Promise<Course | null> {
    const result = await CourseModel.findOne({ id });

    if (!result) {
      return null;
    }

    return this.toEntity(result);
  }

  async findSummaryById(id: string): Promise<CourseSummaryDto | null> {
    const doc = await CourseModel.findOne({ id }).select("id title createdBy status minCertificateScore");
    if (!doc) return null;
    return {
      id: doc.id,
      title: doc.title,
      createdBy: doc.createdBy,
      status: doc.status,
      minCertificateScore: typeof doc.minCertificateScore === "number" ? doc.minCertificateScore : 70,
    };
  }

  async findBySlug(slug: string): Promise<Course | null> {
    const result = await CourseModel.findOne({ slug });

    if (!result) {
      return null;
    }

    return this.toEntity(result);
  }

  async findAll(filter?: { status?: string; category?: string; search?: string }): Promise<Course[]> {
    const query: any = {};

    if (filter?.status && filter.status !== "all") {
      query.status = filter.status;
    }

    if (filter?.category && filter.category !== "all") {
      query.category = new RegExp(`^${filter.category.trim()}$`, "i");
    }

    if (filter?.search && filter.search.trim()) {
      const regex = new RegExp(filter.search.trim(), "i");
      query.$or = [{ title: regex }, { description: regex }, { category: regex }];
    }

    const results = await CourseModel.find(query).sort({
      createdAt: -1,
    });

    return results.map((course) => this.toEntity(course));
  }

  async update(course: Course): Promise<Course> {
    const updated = await CourseModel.findOneAndUpdate(
      { id: course.id },

      {
        title: course.title,

        slug: course.slug,

        description: course.description,

        thumbnail: course.thumbnail || null,

        category: course.category,

        level: course.level,

        language: course.language,

        price: course.price,

        discountPrice: course.discountPrice ?? null,

        duration: course.duration,

        status: course.status,

        requirements: course.requirements,

        learningOutcomes: course.learningOutcomes,
      },

      {
        returnDocument: "after",
      },
    );

    if (!updated) {
      throw new Error("Course not found for update.");
    }

    return this.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await CourseModel.deleteOne({ id });
  }
}
