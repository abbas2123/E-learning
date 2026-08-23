import { randomUUID } from "crypto";
import { DiscussionReportModel, ReportStatus } from "../database/DiscussionReport";
import type {
  IDiscussionReportRepository,
  DiscussionReportDto,
  CreateDiscussionReportParams,
} from "../interface/IDiscussionReportRepository";

export class DiscussionReportRepository implements IDiscussionReportRepository {
  private toDto(doc: any): DiscussionReportDto {
    return {
      id: doc.id,
      discussionId: doc.discussionId,
      replyId: doc.replyId ?? null,
      reportedBy: doc.reportedBy,
      reason: doc.reason,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async create(params: CreateDiscussionReportParams): Promise<DiscussionReportDto> {
    // Prevent duplicate reports
    const existing = await DiscussionReportModel.findOne({
      reportedBy: params.reportedBy,
      discussionId: params.discussionId,
      replyId: params.replyId ?? null,
    });
    if (existing) {
      throw new Error("You have already reported this content.");
    }

    const doc = await DiscussionReportModel.create({
      id: randomUUID(),
      ...params,
      replyId: params.replyId ?? null,
    });
    return this.toDto(doc);
  }

  async findById(reportId: string): Promise<DiscussionReportDto | null> {
    const doc = await DiscussionReportModel.findOne({ id: reportId });
    if (!doc) return null;
    return this.toDto(doc);
  }

  async findAll(
    page: number,
    limit: number,
    status?: string,
  ): Promise<{
    reports: DiscussionReportDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const safeLimit = Math.min(limit, 100);
    const skip = (page - 1) * safeLimit;
    const query: Record<string, unknown> = {};
    if (status && status !== "all") query.status = status;

    const [docs, total] = await Promise.all([
      DiscussionReportModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
      DiscussionReportModel.countDocuments(query),
    ]);

    return {
      reports: docs.map((d) => this.toDto(d)),
      total,
      page,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  async updateStatus(reportId: string, status: ReportStatus): Promise<DiscussionReportDto | null> {
    const doc = await DiscussionReportModel.findOneAndUpdate(
      { id: reportId },
      { $set: { status } },
      { new: true },
    );
    if (!doc) return null;
    return this.toDto(doc);
  }

  async deleteByDiscussionId(discussionId: string): Promise<void> {
    await DiscussionReportModel.deleteMany({ discussionId });
  }
}
