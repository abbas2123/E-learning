import type { IDiscussionReportRepository, DiscussionReportDto } from "../interface/IDiscussionReportRepository";
import type { IDiscussionRepository } from "../interface/IDiscussionRepository";
import type { IDiscussionReplyRepository } from "../interface/IDiscussionReplyRepository";

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
    // Verify discussion exists
    const discussion = await this.discussionRepo.findById(discussionId);
    if (!discussion) throw Object.assign(new Error("Discussion not found."), { statusCode: 404 });

    // If reporting a reply, verify it exists and belongs to this discussion
    if (replyId) {
      const reply = await this.replyRepo.findById(replyId);
      if (!reply || reply.discussionId !== discussionId) {
        throw Object.assign(new Error("Reply not found in this discussion."), { statusCode: 404 });
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
