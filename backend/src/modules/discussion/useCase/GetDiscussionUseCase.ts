import type { IDiscussionRepository, DiscussionDto } from "../interface/IDiscussionRepository";
import type { IDiscussionReplyRepository, DiscussionReplyDto } from "../interface/IDiscussionReplyRepository";
import { NotFoundError, ValidationError } from "../../../core/errors/AppError";

export class GetDiscussionUseCase {
  constructor(
    private readonly discussionRepo: IDiscussionRepository,
    private readonly replyRepo: IDiscussionReplyRepository,
  ) {}

  async execute(discussionId: string): Promise<{ discussion: DiscussionDto; replies: DiscussionReplyDto[] }> {
    if (!discussionId) throw new ValidationError("Discussion ID is required.");

    const discussion = await this.discussionRepo.findById(discussionId);
    if (!discussion) throw new NotFoundError("Discussion not found.", "DISCUSSION_NOT_FOUND");

    const replies = await this.replyRepo.findByDiscussionId(discussionId);

    return { discussion, replies };
  }
}

