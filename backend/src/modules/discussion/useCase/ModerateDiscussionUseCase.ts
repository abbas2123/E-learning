import { DiscussionStatus } from "../database/Discussion";
import { ReportStatus } from "../database/DiscussionReport";
import type { IDiscussionRepository } from "../interface/IDiscussionRepository";
import type { IDiscussionReplyRepository } from "../interface/IDiscussionReplyRepository";
import type { IDiscussionReportRepository } from "../interface/IDiscussionReportRepository";

export type ModerationAction =
  | "lock"
  | "unlock"
  | "delete_discussion"
  | "delete_reply"
  | "review_report"
  | "dismiss_report"
  | "action_taken";

export class ModerateDiscussionUseCase {
  constructor(
    private readonly discussionRepo: IDiscussionRepository,
    private readonly replyRepo: IDiscussionReplyRepository,
    private readonly reportRepo: IDiscussionReportRepository,
  ) {}

  async execute(
    action: ModerationAction,
    discussionId?: string,
    replyId?: string,
    reportId?: string,
  ): Promise<{ success: boolean; message: string }> {
    switch (action) {
      case "lock": {
        if (!discussionId) throw new Error("discussionId required.");
        const d = await this.discussionRepo.findById(discussionId);
        if (!d) throw Object.assign(new Error("Discussion not found."), { statusCode: 404 });
        await this.discussionRepo.update(discussionId, { status: DiscussionStatus.LOCKED });
        return { success: true, message: "Discussion locked." };
      }

      case "unlock": {
        if (!discussionId) throw new Error("discussionId required.");
        const d = await this.discussionRepo.findById(discussionId);
        if (!d) throw Object.assign(new Error("Discussion not found."), { statusCode: 404 });
        await this.discussionRepo.update(discussionId, { status: DiscussionStatus.OPEN });
        return { success: true, message: "Discussion unlocked." };
      }

      case "delete_discussion": {
        if (!discussionId) throw new Error("discussionId required.");
        await Promise.all([
          this.replyRepo.deleteByDiscussionId(discussionId),
          this.reportRepo.deleteByDiscussionId(discussionId),
        ]);
        await this.discussionRepo.delete(discussionId);
        return { success: true, message: "Discussion deleted." };
      }

      case "delete_reply": {
        if (!replyId || !discussionId) throw new Error("discussionId and replyId required.");
        await this.replyRepo.delete(replyId);
        await this.discussionRepo.decrementReplyCount(discussionId);
        return { success: true, message: "Reply deleted." };
      }

      case "review_report": {
        if (!reportId) throw new Error("reportId required.");
        await this.reportRepo.updateStatus(reportId, ReportStatus.REVIEWED);
        return { success: true, message: "Report marked as reviewed." };
      }

      case "dismiss_report": {
        if (!reportId) throw new Error("reportId required.");
        await this.reportRepo.updateStatus(reportId, ReportStatus.DISMISSED);
        return { success: true, message: "Report dismissed." };
      }

      case "action_taken": {
        if (!reportId) throw new Error("reportId required.");
        await this.reportRepo.updateStatus(reportId, ReportStatus.ACTION_TAKEN);
        return { success: true, message: "Report resolved with action taken." };
      }

      default:
        throw Object.assign(new Error("Unknown moderation action."), { statusCode: 400 });
    }
  }
}
