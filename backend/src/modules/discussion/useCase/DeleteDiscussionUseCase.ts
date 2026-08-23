import { CourseModel } from "../../course/repository/database/Course";
import type { IDiscussionRepository } from "../interface/IDiscussionRepository";
import type { IDiscussionReplyRepository } from "../interface/IDiscussionReplyRepository";
import type { IDiscussionReportRepository } from "../interface/IDiscussionReportRepository";

export class DeleteDiscussionUseCase {
  constructor(
    private readonly discussionRepo: IDiscussionRepository,
    private readonly replyRepo: IDiscussionReplyRepository,
    private readonly reportRepo: IDiscussionReportRepository,
  ) {}

  async execute(discussionId: string, requesterId: string, requesterRole: string): Promise<void> {
    const discussion = await this.discussionRepo.findById(discussionId);
    if (!discussion) throw Object.assign(new Error("Discussion not found."), { statusCode: 404 });

    const isAdmin = requesterRole === "admin";
    const isAuthor = discussion.studentId === requesterId;

    if (!isAdmin && !isAuthor) {
      // Check if instructor owns the course
      const course = await CourseModel.findOne({ id: discussion.courseId }).select("createdBy");
      const isInstructor = course?.createdBy === requesterId;
      if (!isInstructor) {
        throw Object.assign(new Error("You are not authorised to delete this discussion."), { statusCode: 403 });
      }
    }

    // Cascade: delete replies and reports
    await Promise.all([
      this.replyRepo.deleteByDiscussionId(discussionId),
      this.reportRepo.deleteByDiscussionId(discussionId),
    ]);

    await this.discussionRepo.delete(discussionId);
  }
}
