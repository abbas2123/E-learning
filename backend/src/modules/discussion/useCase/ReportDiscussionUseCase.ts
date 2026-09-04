import type { IDiscussionReportRepository, DiscussionReportDto } from "../interface/IDiscussionReportRepository";
import type { IDiscussionRepository } from "../interface/IDiscussionRepository";
import type { IDiscussionReplyRepository } from "../interface/IDiscussionReplyRepository";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../../core/errors/AppError";

export class ReportDiscussionUseCase {
  constructor(
    private readonly reportRepo: IDiscussionReportRepository,
    private readonly discussionRepo: IDiscussionRepository,
    private readonly replyRepo: IDiscussionReplyRepository,
  ) {}

  async execute(
    reportedBy: string,
    discussionId: string,
    reason: string,
    replyId?: string | null,
  ): Promise<DiscussionReportDto> {
    if (!reportedBy) throw new ForbiddenError("Authentication required.");
    if (!discussionId) throw new ValidationError("Discussion ID is required.");
    if (!reason || !reason.trim()) throw new ValidationError("Report reason is required.");

    // Verify discussion exists
    const discussion = await this.discussionRepo.findById(discussionId);
    if (!discussion) throw new NotFoundError("Discussion not found.", "DISCUSSION_NOT_FOUND");

    // If reporting a reply, verify it exists and belongs to this discussion
    if (replyId) {
      const reply = await this.replyRepo.findById(replyId);
      if (!reply || reply.discussionId !== discussionId) {
        throw new NotFoundError("Reply not found in this discussion.", "REPLY_NOT_FOUND");
      }
    }

    return this.reportRepo.create({
      discussionId,
      replyId: replyId ?? null,
      reportedBy,
      reason: reason.trim(),
    });
  }
}

