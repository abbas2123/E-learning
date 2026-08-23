import { CourseModel } from "../../course/repository/database/Course";
import type { IDiscussionRepository } from "../interface/IDiscussionRepository";
import type { IDiscussionReplyRepository } from "../interface/IDiscussionReplyRepository";

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
    const reply = await this.replyRepo.findById(replyId);
    if (!reply) throw Object.assign(new Error("Reply not found."), { statusCode: 404 });

    const isAdmin = requesterRole === "admin";
    const isAuthor = reply.authorId === requesterId;

    if (!isAdmin && !isAuthor) {
      // Instructors may delete replies on their own courses
      const discussion = await this.discussionRepo.findById(reply.discussionId);
      if (discussion) {
        const course = await CourseModel.findOne({ id: discussion.courseId }).select("createdBy");
        if (!course || course.createdBy !== requesterId) {
          throw Object.assign(new Error("You are not authorised to delete this reply."), { statusCode: 403 });
        }
      } else {
        throw Object.assign(new Error("You are not authorised to delete this reply."), { statusCode: 403 });
      }
    }

    await this.replyRepo.delete(replyId);
    await this.discussionRepo.decrementReplyCount(reply.discussionId);
  }
}
