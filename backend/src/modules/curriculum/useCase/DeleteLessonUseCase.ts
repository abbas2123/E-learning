import type { ILessonRepository } from "../interface/ILessonRepository";
import { CourseModel } from "../../course/repository/database/Course";

export interface DeleteLessonInput {
  lessonId: string;
  userId: string;
  userRole?: string;
}

export class DeleteLessonUseCase {
  constructor(private readonly lessonRepository: ILessonRepository) {}

  async execute(input: DeleteLessonInput): Promise<boolean> {
    const { lessonId, userId, userRole } = input;

    if (!lessonId) throw new Error("Lesson ID is required.");

    const lesson = await this.lessonRepository.findById(lessonId);
    if (!lesson) throw new Error("Lesson not found.");

    if (userRole !== "admin") {
      const course = await CourseModel.findOne({ id: lesson.courseId });
      if (!course || course.createdBy !== userId) {
        throw new Error("Unauthorized to delete this lesson.");
      }
    }

    const deleted = await this.lessonRepository.deleteLesson(lessonId);
    if (!deleted) throw new Error("Failed to delete lesson.");
    return true;
  }
}
