import { CourseModel } from "../../course/repository/database/Course";
import type { IDiscussionRepository, DiscussionDto } from "../interface/IDiscussionRepository";

export class PinDiscussionUseCase {
  constructor(private readonly discussionRepo: IDiscussionRepository) {}

  async execute(
    discussionId: string,
    requesterId: string,
    requesterRole: string,
  ): Promise<DiscussionDto> {
    const discussion = await this.discussionRepo.findById(discussionId);
    if (!discussion) throw Object.assign(new Error("Discussion not found."), { statusCode: 404 });

    const isAdmin = requesterRole === "admin";
    if (!isAdmin) {
      const course = await CourseModel.findOne({ id: discussion.courseId }).select("createdBy");
      if (!course || course.createdBy !== requesterId) {
        throw Object.assign(new Error("Only course instructors or admins can pin discussions."), { statusCode: 403 });
      }
    }

    const updated = await this.discussionRepo.update(discussionId, { isPinned: !discussion.isPinned });
    if (!updated) throw new Error("Failed to update pin state.");
    return updated;
  }
}
