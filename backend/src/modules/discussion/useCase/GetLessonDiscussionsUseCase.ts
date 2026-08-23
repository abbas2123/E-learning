import type { IDiscussionRepository, PaginatedDiscussionsDto } from "../interface/IDiscussionRepository";
import { LessonModel } from "../../curriculum/database/Lesson";

export class GetLessonDiscussionsUseCase {
  constructor(private readonly discussionRepo: IDiscussionRepository) {}

  async execute(
    courseId: string,
    lessonId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedDiscussionsDto> {
    // Verify lesson belongs to course
    const lesson = await LessonModel.findOne({ id: lessonId });
    if (!lesson) throw new Error("Lesson not found.");
    if (lesson.courseId !== courseId) {
      throw Object.assign(new Error("Lesson does not belong to this course."), { statusCode: 400 });
    }

    return this.discussionRepo.findLessonDiscussions(courseId, lessonId, page, limit);
  }
}
