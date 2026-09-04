import { CourseModel } from "../../course/repository/database/Course";
import type { IDiscussionRepository, DiscussionDto } from "../interface/IDiscussionRepository";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../../core/errors/AppError";

export class PinDiscussionUseCase {
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

    const isAdmin = requesterRole === "admin";
    if (!isAdmin) {
      const course = await CourseModel.findOne({ id: discussion.courseId }).select("createdBy");
      if (!course || course.createdBy !== requesterId) {
        throw new ForbiddenError("Only course instructors or admins can pin discussions.");
      }
    }

    const updated = await this.discussionRepo.update(discussionId, { isPinned: !discussion.isPinned });
    if (!updated) throw new NotFoundError("Failed to update pin state.", "DISCUSSION_NOT_FOUND");
    return updated;
  }
}

