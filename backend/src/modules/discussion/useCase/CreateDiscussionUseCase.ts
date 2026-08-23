import { EnrollmentModel } from "../../admin/Repository/database/Enrollment";
import { CourseModel } from "../../course/repository/database/Course";
import { LessonModel } from "../../curriculum/database/Lesson";
import { NotificationModel } from "../../admin/Repository/database/Notification";
import type { IDiscussionRepository, DiscussionDto } from "../interface/IDiscussionRepository";
import { randomUUID } from "crypto";

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
    const course = await CourseModel.findOne({ id: courseId }).select("id title createdBy");
    if (!course) throw new Error("Course not found.");

    // Verify student is enrolled
    const enrollment = await EnrollmentModel.findOne({
      studentId,
      courseId,
      status: "completed",
    });
    if (!enrollment) {
      throw Object.assign(new Error("You must be enrolled in this course to ask a question."), { statusCode: 403 });
    }

    // Validate lessonId if provided
    if (lessonId) {
      const lesson = await LessonModel.findOne({ id: lessonId });
      if (!lesson) throw new Error("Lesson not found.");
      if (lesson.courseId !== courseId) {
        throw Object.assign(new Error("Lesson does not belong to this course."), { statusCode: 400 });
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
