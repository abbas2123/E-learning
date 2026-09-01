import { EnrollmentModel } from "../../admin/Repository/database/Enrollment";
import { CourseModel } from "../../course/repository/database/Course";
import { LessonModel } from "../../curriculum/database/Lesson";
import { NotificationModel } from "../../admin/Repository/database/Notification";
import type {
  IDiscussionRepository,
  DiscussionDto,
} from "../interface/IDiscussionRepository";
import { randomUUID } from "crypto";
import {
  EnrollmentRequiredError,
  NotFoundError,
  ValidationError,
} from "../../../core/errors/AppError";

export class CreateDiscussionUseCase {
  constructor(private readonly discussionRepo: IDiscussionRepository) {}

  async execute(
    studentId: string,
    courseId: string,
    title: string,
    question: string,
    lessonId?: string | null,
  ): Promise<DiscussionDto> {
    // Validate course exists
    const course = await CourseModel.findOne({ id: courseId }).select(
      "id title createdBy",
    );
    if (!course)
      throw new NotFoundError("Course not found.", "COURSE_NOT_FOUND");

    // Verify student is enrolled
    const enrollment = await EnrollmentModel.findOne({
      studentId,
      courseId,
      status: "completed",
    });
    if (!enrollment) {
      throw new EnrollmentRequiredError(
        "You must be enrolled in this course to ask a question.",
      );
    }

    // Validate lessonId if provided
    if (lessonId) {
      const lesson = await LessonModel.findOne({ id: lessonId });
      if (!lesson)
        throw new NotFoundError("Lesson not found.", "LESSON_NOT_FOUND");
      if (lesson.courseId !== courseId) {
        throw new ValidationError("Lesson does not belong to this course.");
      }
    }

    const discussion = await this.discussionRepo.create({
      courseId,
      lessonId: lessonId ?? null,
      studentId,
      title: title.trim(),
      question: question.trim(),
    });

    // Notify instructor
    try {
      await NotificationModel.create({
        id: randomUUID(),
        title: "New Student Question",
        message: `A student asked a question in your course: "${course.title}".`,
        type: "discussion",
        userId: course.createdBy,
        read: false,
      });
    } catch {
      // Notification failure must not block discussion creation
    }

    return discussion;
  }
}
