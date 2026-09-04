import { randomUUID } from "crypto";
import { CourseModel } from "../../course/repository/database/Course";
import { NotificationModel } from "../../admin/Repository/database/Notification";
import { DiscussionStatus } from "../database/Discussion";
import type { IDiscussionRepository } from "../interface/IDiscussionRepository";
import type { IDiscussionReplyRepository, DiscussionReplyDto } from "../interface/IDiscussionReplyRepository";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../../core/errors/AppError";

export class CreateDiscussionReplyUseCase {
  constructor(
    private readonly discussionRepo: IDiscussionRepository,
    private readonly replyRepo: IDiscussionReplyRepository,
  ) {}

  async execute(
    discussionId: string,
    authorId: string,
    authorRole: string,
    content: string,
  ): Promise<DiscussionReplyDto> {
    if (!discussionId) throw new ValidationError("Discussion ID is required.");
    if (!authorId) throw new ForbiddenError("Authentication required.");
    if (!content || !content.trim()) throw new ValidationError("Reply content cannot be empty.");

    const discussion = await this.discussionRepo.findById(discussionId);
    if (!discussion) throw new NotFoundError("Discussion not found.", "DISCUSSION_NOT_FOUND");

    if (discussion.status === DiscussionStatus.LOCKED) {
      throw new ForbiddenError("This discussion is locked and cannot receive new replies.");
    }

    // Validate instructor owns course if role is instructor
    const isInstructorReply = authorRole === "instructor" || authorRole === "admin";
    if (authorRole === "instructor") {
      const course = await CourseModel.findOne({ id: discussion.courseId }).select("createdBy");
      if (!course || course.createdBy !== authorId) {
        throw new ForbiddenError("You are not the instructor for this course.");
      }
    }

    const reply = await this.replyRepo.create({
      discussionId,
      authorId,
      authorRole: authorRole as "student" | "instructor" | "admin",
      content: content.trim(),
      isInstructorReply,
    });

    // Update reply count and mark as answered if instructor
    await this.discussionRepo.incrementReplyCount(discussionId);
    if (isInstructorReply && discussion.status === DiscussionStatus.OPEN) {
      await this.discussionRepo.update(discussionId, { status: DiscussionStatus.ANSWERED });
    }

    // Notify the student who asked
    try {
      await NotificationModel.create({
        id: randomUUID(),
        title: isInstructorReply ? "Instructor Replied to Your Question" : "New Reply to Your Question",
        message: isInstructorReply
          ? "Your instructor replied to your discussion question."
          : "Someone replied to your question in the course discussion.",
        type: "discussion",
        userId: discussion.studentId,
        read: false,
      });
    } catch {
      // Notification failure must not block reply
    }

    return reply;
  }
}
