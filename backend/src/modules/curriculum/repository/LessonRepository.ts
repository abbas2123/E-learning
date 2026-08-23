import { randomUUID } from "crypto";
import { LessonModel } from "../database/Lesson";
import type { LessonDto } from "../interface/ISectionRepository";
import type {
  ILessonRepository,
  CreateLessonParams,
  UpdateLessonParams,
} from "../interface/ILessonRepository";

export class LessonRepository implements ILessonRepository {
  private toDto(doc: any): LessonDto {
    return {
      id: doc.id ?? doc._id.toString(),
      sectionId: doc.sectionId,
      courseId: doc.courseId,
      title: doc.title,
      description: doc.description ?? undefined,
      type: doc.type ?? "video",
      videoUrl: doc.videoUrl ?? undefined,
      duration: doc.duration ?? 0,
      order: doc.order ?? 1,
      isPreview: Boolean(doc.isPreview),
      resources: doc.resources ?? [],
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async createLesson(params: CreateLessonParams): Promise<LessonDto> {
    let order = params.order;
    if (order === undefined) {
      const max = await this.getMaxOrder(params.sectionId);
      order = max + 1;
    }

    const doc = new LessonModel({
      id: randomUUID(),
      sectionId: params.sectionId,
      courseId: params.courseId,
      title: params.title.trim(),
      description: params.description?.trim() || null,
      type: params.type || "video",
      videoUrl: params.videoUrl?.trim() || null,
      duration: params.duration || 0,
      order,
      isPreview: Boolean(params.isPreview),
      resources: params.resources || [],
    });

    const saved = await doc.save();
    return this.toDto(saved);
  }

  async updateLesson(
    lessonId: string,
    params: UpdateLessonParams,
  ): Promise<LessonDto | null> {
    const lesson = await LessonModel.findOne({ id: lessonId });
    if (!lesson) return null;

    if (params.title !== undefined) lesson.title = params.title.trim();
    if (params.description !== undefined)
      lesson.description = params.description.trim() || null;
    if (params.type !== undefined) lesson.type = params.type;
    if (params.videoUrl !== undefined)
      lesson.videoUrl = params.videoUrl.trim() || null;
    if (params.duration !== undefined) lesson.duration = params.duration;
    if (params.order !== undefined) lesson.order = params.order;
    if (params.isPreview !== undefined) lesson.isPreview = params.isPreview;
    if (params.resources !== undefined) lesson.resources = params.resources as any;

    const saved = await lesson.save();
    return this.toDto(saved);
  }

  async deleteLesson(lessonId: string): Promise<boolean> {
    const result = await LessonModel.deleteOne({ id: lessonId });
    return result.deletedCount > 0;
  }

  async deleteLessonsBySectionId(sectionId: string): Promise<number> {
    const result = await LessonModel.deleteMany({ sectionId });
    return result.deletedCount;
  }

  async findById(lessonId: string): Promise<LessonDto | null> {
    const doc = await LessonModel.findOne({ id: lessonId });
    if (!doc) return null;
    return this.toDto(doc);
  }

  async findBySectionId(sectionId: string): Promise<LessonDto[]> {
    const docs = await LessonModel.find({ sectionId }).sort({ order: 1 });
    return docs.map((d) => this.toDto(d));
  }

  async findByCourseId(courseId: string): Promise<LessonDto[]> {
    const docs = await LessonModel.find({ courseId }).sort({ order: 1 });
    return docs.map((d) => this.toDto(d));
  }

  async reorderLessons(
    sectionId: string,
    orderedLessonIds: string[],
  ): Promise<LessonDto[]> {
    const bulkOps = orderedLessonIds.map((id, index) => ({
      updateOne: {
        filter: { id, sectionId },
        update: { $set: { order: index + 1 } },
      },
    }));

    if (bulkOps.length > 0) {
      await LessonModel.bulkWrite(bulkOps);
    }

    return this.findBySectionId(sectionId);
  }

  async getMaxOrder(sectionId: string): Promise<number> {
    const highest = await LessonModel.findOne({ sectionId })
      .sort({ order: -1 })
      .select("order");
    return highest?.order ?? 0;
  }
}
