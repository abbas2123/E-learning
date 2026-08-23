import { randomUUID } from "crypto";
import { DiscussionModel } from "../database/Discussion";
import { UserModel } from "../../auth/Repository/database/User";
import { CourseModel } from "../../course/repository/database/Course";
import type {
  IDiscussionRepository,
  DiscussionDto,
  DiscussionAuthorDto,
  CreateDiscussionParams,
  UpdateDiscussionParams,
  PaginatedDiscussionsDto,
} from "../interface/IDiscussionRepository";

export class DiscussionRepository implements IDiscussionRepository {
  private async buildAuthor(userId: string): Promise<DiscussionAuthorDto> {
    const user = await UserModel.findOne({ id: userId }).select("id name avatar role");
    if (!user) return { id: userId, name: "Unknown User", avatar: null, role: "student" };
    return { id: user.id, name: user.name, avatar: user.avatar ?? null, role: user.role };
  }

  private async toDto(doc: any, withAuthor = false): Promise<DiscussionDto> {
    let author: DiscussionAuthorDto = { id: doc.studentId, name: "", avatar: null, role: "student" };
    if (withAuthor) {
      author = await this.buildAuthor(doc.studentId);
    }

    let courseTitle: string | undefined;
    try {
      const course = await CourseModel.findOne({ id: doc.courseId }).select("title");
      courseTitle = course?.title;
    } catch {
      courseTitle = undefined;
    }

    return {
      id: doc.id,
      courseId: doc.courseId,
      courseTitle,
      lessonId: doc.lessonId ?? null,
      lessonTitle: null,
      studentId: doc.studentId,
      author,
      title: doc.title,
      question: doc.question,
      status: doc.status,
      isPinned: Boolean(doc.isPinned),
      replyCount: doc.replyCount ?? 0,
      lastReplyAt: doc.lastReplyAt,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async create(params: CreateDiscussionParams): Promise<DiscussionDto> {
    const doc = await DiscussionModel.create({
      id: randomUUID(),
      ...params,
      lastReplyAt: new Date(),
    });
    return this.toDto(doc, true);
  }

  async findById(discussionId: string): Promise<DiscussionDto | null> {
    const doc = await DiscussionModel.findOne({ id: discussionId });
    if (!doc) return null;
    return this.toDto(doc, true);
  }

  async findCourseDiscussions(
    courseId: string,
    page: number,
    limit: number,
    status?: string,
    sort = "newest",
  ): Promise<PaginatedDiscussionsDto> {
    const safeLimit = Math.min(limit, 100);
    const skip = (page - 1) * safeLimit;

    const query: Record<string, unknown> = { courseId };
    if (status && status !== "all") query.status = status;

    const sortOrder = sort === "active"
      ? { isPinned: -1, lastReplyAt: -1 }
      : { isPinned: -1, createdAt: -1 };

    const [docs, total] = await Promise.all([
      DiscussionModel.find(query).sort(sortOrder as any).skip(skip).limit(safeLimit),
      DiscussionModel.countDocuments(query),
    ]);

    const discussions = await Promise.all(docs.map((d) => this.toDto(d, true)));

    return { discussions, total, page, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) };
  }

  async findLessonDiscussions(
    courseId: string,
    lessonId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedDiscussionsDto> {
    const safeLimit = Math.min(limit, 100);
    const skip = (page - 1) * safeLimit;

    const query = { courseId, lessonId };
    const [docs, total] = await Promise.all([
      DiscussionModel.find(query).sort({ isPinned: -1, createdAt: -1 }).skip(skip).limit(safeLimit),
      DiscussionModel.countDocuments(query),
    ]);

    const discussions = await Promise.all(docs.map((d) => this.toDto(d, true)));
    return { discussions, total, page, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) };
  }

  async findInstructorDiscussions(
    instructorId: string,
    page: number,
    limit: number,
    status?: string,
    courseId?: string,
    search?: string,
  ): Promise<PaginatedDiscussionsDto> {
    const safeLimit = Math.min(limit, 100);
    const skip = (page - 1) * safeLimit;

    // Get all course IDs owned by this instructor
    const ownedCourses = await CourseModel.find({ createdBy: instructorId }).select("id");
    const ownedCourseIds = ownedCourses.map((c) => c.id);

    const query: Record<string, unknown> = {
      courseId: courseId ? courseId : { $in: ownedCourseIds },
    };
    if (status && status !== "all") query.status = status;
    if (search && search.trim()) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.$or = [
        { title: { $regex: escaped, $options: "i" } },
        { question: { $regex: escaped, $options: "i" } },
      ];
    }

    const [docs, total] = await Promise.all([
      DiscussionModel.find(query).sort({ isPinned: -1, lastReplyAt: -1 }).skip(skip).limit(safeLimit),
      DiscussionModel.countDocuments(query),
    ]);

    const discussions = await Promise.all(docs.map((d) => this.toDto(d, true)));
    return { discussions, total, page, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) };
  }

  async search(
    courseId: string,
    queryStr: string,
    page: number,
    limit: number,
  ): Promise<PaginatedDiscussionsDto> {
    const safeLimit = Math.min(limit, 100);
    const skip = (page - 1) * safeLimit;
    const escaped = queryStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const query = {
      courseId,
      $or: [
        { title: { $regex: escaped, $options: "i" } },
        { question: { $regex: escaped, $options: "i" } },
      ],
    };

    const [docs, total] = await Promise.all([
      DiscussionModel.find(query).sort({ isPinned: -1, createdAt: -1 }).skip(skip).limit(safeLimit),
      DiscussionModel.countDocuments(query),
    ]);

    const discussions = await Promise.all(docs.map((d) => this.toDto(d, true)));
    return { discussions, total, page, limit: safeLimit, totalPages: Math.ceil(total / safeLimit) };
  }

  async update(discussionId: string, params: UpdateDiscussionParams): Promise<DiscussionDto | null> {
    const doc = await DiscussionModel.findOneAndUpdate(
      { id: discussionId },
      { $set: params },
      { new: true, runValidators: true },
    );
    if (!doc) return null;
    return this.toDto(doc, true);
  }

  async incrementReplyCount(discussionId: string): Promise<void> {
    await DiscussionModel.findOneAndUpdate(
      { id: discussionId },
      { $inc: { replyCount: 1 }, $set: { lastReplyAt: new Date() } },
    );
  }

  async decrementReplyCount(discussionId: string): Promise<void> {
    await DiscussionModel.findOneAndUpdate(
      { id: discussionId },
      { $inc: { replyCount: -1 } },
    );
  }

  async delete(discussionId: string): Promise<boolean> {
    const result = await DiscussionModel.deleteOne({ id: discussionId });
    return result.deletedCount > 0;
  }
}
