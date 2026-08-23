import { randomUUID } from "crypto";
import { SectionModel } from "../database/Section";
import type {
  ISectionRepository,
  SectionDto,
  CreateSectionParams,
  UpdateSectionParams,
} from "../interface/ISectionRepository";

export class SectionRepository implements ISectionRepository {
  private toDto(doc: any): SectionDto {
    return {
      id: doc.id ?? doc._id.toString(),
      courseId: doc.courseId,
      title: doc.title,
      description: doc.description ?? undefined,
      order: doc.order,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async createSection(params: CreateSectionParams): Promise<SectionDto> {
    let order = params.order;
    if (order === undefined) {
      const max = await this.getMaxOrder(params.courseId);
      order = max + 1;
    }

    const doc = new SectionModel({
      id: randomUUID(),
      courseId: params.courseId,
      title: params.title.trim(),
      description: params.description?.trim() || null,
      order,
    });

    const saved = await doc.save();
    return this.toDto(saved);
  }

  async updateSection(
    sectionId: string,
    params: UpdateSectionParams,
  ): Promise<SectionDto | null> {
    const section = await SectionModel.findOne({ id: sectionId });
    if (!section) return null;

    if (params.title !== undefined) section.title = params.title.trim();
    if (params.description !== undefined)
      section.description = params.description.trim() || null;
    if (params.order !== undefined) section.order = params.order;

    const saved = await section.save();
    return this.toDto(saved);
  }

  async deleteSection(sectionId: string): Promise<boolean> {
    const result = await SectionModel.deleteOne({ id: sectionId });
    return result.deletedCount > 0;
  }

  async findById(sectionId: string): Promise<SectionDto | null> {
    const doc = await SectionModel.findOne({ id: sectionId });
    if (!doc) return null;
    return this.toDto(doc);
  }

  async findByCourseId(courseId: string): Promise<SectionDto[]> {
    const docs = await SectionModel.find({ courseId }).sort({ order: 1 });
    return docs.map((d) => this.toDto(d));
  }

  async reorderSections(
    courseId: string,
    orderedSectionIds: string[],
  ): Promise<SectionDto[]> {
    const bulkOps = orderedSectionIds.map((id, index) => ({
      updateOne: {
        filter: { id, courseId },
        update: { $set: { order: index + 1 } },
      },
    }));

    if (bulkOps.length > 0) {
      await SectionModel.bulkWrite(bulkOps);
    }

    return this.findByCourseId(courseId);
  }

  async getMaxOrder(courseId: string): Promise<number> {
    const highest = await SectionModel.findOne({ courseId })
      .sort({ order: -1 })
      .select("order");
    return highest?.order ?? 0;
  }
}
