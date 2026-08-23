import type { IDiscussionReplyRepository, DiscussionReplyDto } from "../interface/IDiscussionReplyRepository";

export class UpdateDiscussionReplyUseCase {
  constructor(private readonly replyRepo: IDiscussionReplyRepository) {}

  async execute(
    replyId: string,
    requesterId: string,
    content: string,
  ): Promise<DiscussionReplyDto> {
    const reply = await this.replyRepo.findById(replyId);
    if (!reply) throw Object.assign(new Error("Reply not found."), { statusCode: 404 });

    if (reply.authorId !== requesterId) {
      throw Object.assign(new Error("You are not authorised to edit this reply."), { statusCode: 403 });
    }

    const updated = await this.replyRepo.update(replyId, content.trim());
    if (!updated) throw new Error("Failed to update reply.");
    return updated;
  }
}
