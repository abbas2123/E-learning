import type { IDiscussionRepository, PaginatedDiscussionsDto } from "../interface/IDiscussionRepository";
import { LessonModel } from "../../curriculum/database/Lesson";
import { NotFoundError, ValidationError } from "../../../core/errors/AppError";

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
    if (!lesson) throw new NotFoundError("Lesson not found.", "LESSON_NOT_FOUND");
    if (lesson.courseId !== courseId) {
      throw new ValidationError("Lesson does not belong to this course.");
    }

    return this.discussionRepo.findLessonDiscussions(courseId, lessonId, page, limit);
  }
}

