import { CourseModel } from "../../course/repository/database/Course";
import type { IDiscussionRepository } from "../interface/IDiscussionRepository";
import type { IDiscussionReplyRepository } from "../interface/IDiscussionReplyRepository";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../../core/errors/AppError";

export class DeleteDiscussionReplyUseCase {
  constructor(
    private readonly discussionRepo: IDiscussionRepository,
    private readonly replyRepo: IDiscussionReplyRepository,
  ) {}

  async execute(
    replyId: string,
    requesterId: string,
    requesterRole: string,
  ): Promise<void> {
    if (!replyId) throw new ValidationError("Reply ID is required.");

    const reply = await this.replyRepo.findById(replyId);
    if (!reply) throw new NotFoundError("Reply not found.", "REPLY_NOT_FOUND");

    const isAdmin = requesterRole === "admin";
    const isAuthor = reply.authorId === requesterId;

    if (!isAdmin && !isAuthor) {
      // Instructors may delete replies on their own courses
      const discussion = await this.discussionRepo.findById(reply.discussionId);
      if (discussion) {
        const course = await CourseModel.findOne({ id: discussion.courseId }).select("createdBy");
        if (!course || course.createdBy !== requesterId) {
          throw new ForbiddenError("You are not authorised to delete this reply.");
        }
      } else {
        throw new ForbiddenError("You are not authorised to delete this reply.");
      }
    }

    await this.replyRepo.delete(replyId);
    await this.discussionRepo.decrementReplyCount(reply.discussionId);
  }
}
