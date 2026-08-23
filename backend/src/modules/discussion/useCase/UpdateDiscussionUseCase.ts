import type { IDiscussionRepository, DiscussionDto } from "../interface/IDiscussionRepository";

export class UpdateDiscussionUseCase {
  constructor(private readonly discussionRepo: IDiscussionRepository) {}

  async execute(
    discussionId: string,
    requesterId: string,
    title?: string,
    question?: string,
  ): Promise<DiscussionDto> {
    const discussion = await this.discussionRepo.findById(discussionId);
    if (!discussion) throw Object.assign(new Error("Discussion not found."), { statusCode: 404 });

    if (discussion.studentId !== requesterId) {
      throw Object.assign(new Error("You are not authorised to edit this discussion."), { statusCode: 403 });
    }

    if (discussion.status === "locked") {
      throw Object.assign(new Error("Locked discussions cannot be edited."), { statusCode: 403 });
    }

    const updated = await this.discussionRepo.update(discussionId, {
      ...(title ? { title: title.trim() } : {}),
      ...(question ? { question: question.trim() } : {}),
    });

    if (!updated) throw new Error("Failed to update discussion.");
    return updated;
  }
}
