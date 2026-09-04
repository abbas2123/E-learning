import type { IDiscussionRepository, DiscussionDto } from "../interface/IDiscussionRepository";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../../core/errors/AppError";

export class UpdateDiscussionUseCase {
  constructor(private readonly discussionRepo: IDiscussionRepository) {}

  async execute(
    discussionId: string,
    requesterId: string,
    title?: string,
    question?: string,
  ): Promise<DiscussionDto> {
    if (!discussionId) throw new ValidationError("Discussion ID is required.");
    if (!requesterId) throw new ForbiddenError("Authentication required.");

    const discussion = await this.discussionRepo.findById(discussionId);
    if (!discussion) throw new NotFoundError("Discussion not found.", "DISCUSSION_NOT_FOUND");

    if (discussion.studentId !== requesterId) {
      throw new ForbiddenError("You are not authorised to edit this discussion.");
    }

    if (discussion.status === "locked") {
      throw new ForbiddenError("Locked discussions cannot be edited.");
    }

    const updated = await this.discussionRepo.update(discussionId, {
      ...(title ? { title: title.trim() } : {}),
      ...(question ? { question: question.trim() } : {}),
    });

    if (!updated) throw new NotFoundError("Failed to update discussion.", "DISCUSSION_NOT_FOUND");
    return updated;
  }
}
