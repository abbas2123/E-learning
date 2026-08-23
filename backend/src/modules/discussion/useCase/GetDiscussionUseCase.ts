import type { IDiscussionRepository, DiscussionDto } from "../interface/IDiscussionRepository";
import type { IDiscussionReplyRepository, DiscussionReplyDto } from "../interface/IDiscussionReplyRepository";

export class GetDiscussionUseCase {
  constructor(
    private readonly discussionRepo: IDiscussionRepository,
    private readonly replyRepo: IDiscussionReplyRepository,
  ) {}

  async execute(discussionId: string): Promise<{ discussion: DiscussionDto; replies: DiscussionReplyDto[] }> {
    const discussion = await this.discussionRepo.findById(discussionId);
    if (!discussion) throw Object.assign(new Error("Discussion not found."), { statusCode: 404 });

    const replies = await this.replyRepo.findByDiscussionId(discussionId);

    return { discussion, replies };
  }
}
