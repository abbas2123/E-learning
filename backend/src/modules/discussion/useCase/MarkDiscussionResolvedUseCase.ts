import { CourseModel } from "../../course/repository/database/Course";
import { DiscussionStatus } from "../database/Discussion";
import type { IDiscussionRepository, DiscussionDto } from "../interface/IDiscussionRepository";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../../core/errors/AppError";

export class MarkDiscussionResolvedUseCase {
  constructor(private readonly discussionRepo: IDiscussionRepository) {}

  async execute(
    discussionId: string,
    requesterId: string,
    requesterRole: string,
  ): Promise<DiscussionDto> {
    if (!discussionId) throw new ValidationError("Discussion ID is required.");
    if (!requesterId) throw new ForbiddenError("Authentication required.");

    const discussion = await this.discussionRepo.findById(discussionId);
    if (!discussion) throw new NotFoundError("Discussion not found.", "DISCUSSION_NOT_FOUND");

    if (discussion.status === DiscussionStatus.LOCKED) {
      throw new ForbiddenError("Locked discussions cannot be modified.");
    }

    const isAdmin = requesterRole === "admin";
    const isAuthor = discussion.studentId === requesterId;

    if (!isAdmin && !isAuthor) {
      const course = await CourseModel.findOne({ id: discussion.courseId }).select("createdBy");
      const isInstructor = course?.createdBy === requesterId;
      if (!isInstructor) {
        throw new ForbiddenError("Only the question author or instructor can resolve this discussion.");
      }
    }

    // Toggle between resolved and answered/open
    const newStatus =
      discussion.status === DiscussionStatus.RESOLVED
        ? DiscussionStatus.OPEN
        : DiscussionStatus.RESOLVED;

    const updated = await this.discussionRepo.update(discussionId, { status: newStatus });
    if (!updated) throw new NotFoundError("Failed to update discussion status.", "DISCUSSION_NOT_FOUND");
    return updated;
  }
}

