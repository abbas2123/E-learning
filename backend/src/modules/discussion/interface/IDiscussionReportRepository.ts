import type { ReportStatus } from "../database/DiscussionReport";

export interface DiscussionReportDto {
  id: string;
  discussionId: string;
  replyId: string | null;
  reportedBy: string;
  reporterName?: string;
  reason: string;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDiscussionReportParams {
  discussionId: string;
  replyId?: string | null;
  reportedBy: string;
  reason: string;
}

export interface IDiscussionReportRepository {
  create(params: CreateDiscussionReportParams): Promise<DiscussionReportDto>;
  findById(reportId: string): Promise<DiscussionReportDto | null>;
  findAll(page: number, limit: number, status?: string): Promise<{
    reports: DiscussionReportDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  updateStatus(reportId: string, status: ReportStatus): Promise<DiscussionReportDto | null>;
  deleteByDiscussionId(discussionId: string): Promise<void>;
}
