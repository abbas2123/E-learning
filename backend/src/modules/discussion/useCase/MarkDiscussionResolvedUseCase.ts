import { CourseModel } from "../../course/repository/database/Course";
import { DiscussionStatus } from "../database/Discussion";
import type { IDiscussionRepository, DiscussionDto } from "../interface/IDiscussionRepository";

export class MarkDiscussionResolvedUseCase {
  constructor(private readonly discussionRepo: IDiscussionRepository) {}

  async execute(
    discussionId: string,
    requesterId: string,
    requesterRole: string,
  ): Promise<DiscussionDto> {
    const discussion = await this.discussionRepo.findById(discussionId);
    if (!discussion) throw Object.assign(new Error("Discussion not found."), { statusCode: 404 });

    if (discussion.status === DiscussionStatus.LOCKED) {
      throw Object.assign(new Error("Locked discussions cannot be modified."), { statusCode: 403 });
    }

    const isAdmin = requesterRole === "admin";
    const isAuthor = discussion.studentId === requesterId;

    if (!isAdmin && !isAuthor) {
      const course = await CourseModel.findOne({ id: discussion.courseId }).select("createdBy");
      const isInstructor = course?.createdBy === requesterId;
      if (!isInstructor) {
        throw Object.assign(new Error("Only the question author or instructor can resolve this discussion."), { statusCode: 403 });
      }
    }

    // Toggle between resolved and answered/open
    const newStatus =
      discussion.status === DiscussionStatus.RESOLVED
        ? DiscussionStatus.OPEN
        : DiscussionStatus.RESOLVED;

    const updated = await this.discussionRepo.update(discussionId, { status: newStatus });
    if (!updated) throw new Error("Failed to update discussion status.");
    return updated;
  }
}
