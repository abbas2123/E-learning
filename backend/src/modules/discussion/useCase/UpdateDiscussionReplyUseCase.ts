import type { IDiscussionReplyRepository, DiscussionReplyDto } from "../interface/IDiscussionReplyRepository";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../../core/errors/AppError";

export class UpdateDiscussionReplyUseCase {
  constructor(private readonly replyRepo: IDiscussionReplyRepository) {}

  async execute(
    replyId: string,
    requesterId: string,
    content: string,
  ): Promise<DiscussionReplyDto> {
    if (!replyId) throw new ValidationError("Reply ID is required.");
    if (!requesterId) throw new ForbiddenError("Authentication required.");
    if (!content || !content.trim()) throw new ValidationError("Content cannot be empty.");

    const reply = await this.replyRepo.findById(replyId);
    if (!reply) throw new NotFoundError("Reply not found.", "REPLY_NOT_FOUND");

    if (reply.authorId !== requesterId) {
      throw new ForbiddenError("You are not authorised to edit this reply.");
    }

    const updated = await this.replyRepo.update(replyId, content.trim());
    if (!updated) throw new NotFoundError("Failed to update reply.", "REPLY_NOT_FOUND");
    return updated;
  }
}

