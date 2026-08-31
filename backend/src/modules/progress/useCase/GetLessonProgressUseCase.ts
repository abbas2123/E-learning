import type {
  ILessonProgressRepository,
  LessonProgressDto,
} from "../interface/ILessonProgressRepository";
import { CourseModel } from "../../course/repository/database/Course";
import { LessonModel } from "../../curriculum/database/Lesson";
import { EnrollmentModel } from "../../admin/Repository/database/Enrollment";

export interface GetLessonProgressInput {
  userId: string;
  courseId: string;
  lessonId: string;
  userRole?: string;
}

export class GetLessonProgressUseCase {
  constructor(
    private readonly progressRepository: ILessonProgressRepository,
  ) {}

  async execute(input: GetLessonProgressInput): Promise<LessonProgressDto> {
    const { userId, courseId, lessonId, userRole } = input;

    if (!userId) throw new Error("Authentication required.");
    if (!courseId) throw new Error("Course ID is required.");
    if (!lessonId) throw new Error("Lesson ID is required.");

    const course = await CourseModel.findOne({ id: courseId });
    if (!course) throw new Error("Course not found.");

    const lesson = await LessonModel.findOne({ id: lessonId });
    if (!lesson) {
      // Check if it corresponds to a course quiz
      const { QuizModel } = await import("../../quiz/database/Quiz.js");
      const quiz = await QuizModel.findOne({ id: lessonId, courseId });
      if (!quiz) {
        // Return default progress rather than crashing
        return {
          id: "",
          studentId: userId,
          courseId,
          lessonId,
          completed: false,
          watchedSeconds: 0,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    } else if (lesson.courseId !== courseId) {
      throw new Error(`Lesson ${lessonId} does not belong to course ${courseId}.`);
    }

    if (userRole !== "admin" && course.createdBy !== userId) {
      const enrollment = await EnrollmentModel.findOne({
        studentId: userId,
        courseId,
        status: "completed",
      });
      if (!enrollment) {
        throw new Error("Access denied. Active enrollment required to view progress.");
      }
    }

    const progress = await this.progressRepository.findByLesson(
      userId,
      courseId,
      lessonId,
    );

    if (!progress) {
      return {
        id: "",
        studentId: userId,
        courseId,
        lessonId,
        completed: false,
        watchedSeconds: 0,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return progress;
  }
}
