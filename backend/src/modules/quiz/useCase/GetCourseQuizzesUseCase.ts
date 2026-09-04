import type { IQuizRepository, QuizDto } from "../interface/IQuizRepository";
import { CourseModel } from "../../course/repository/database/Course";
import { NotFoundError, ValidationError } from "../../../core/errors/AppError";

export interface GetCourseQuizzesInput {
  courseId: string;
  userId?: string;
  userRole?: string;
}

export class GetCourseQuizzesUseCase {
  constructor(private readonly quizRepository: IQuizRepository) {}

  async execute(input: GetCourseQuizzesInput): Promise<QuizDto[]> {
    const { courseId, userId, userRole } = input;

    if (!courseId) throw new ValidationError("Course ID is required.");

    const quizzes = await this.quizRepository.findByCourseId(courseId);

    const course = await CourseModel.findOne({ id: courseId });
    if (!course) throw new NotFoundError("Course not found.", "COURSE_NOT_FOUND");
    const isOwnerOrAdmin =
      userRole === "admin" || (userId && course?.createdBy === userId);

    if (isOwnerOrAdmin) {
      return quizzes;
    }

    // Filter to published quizzes for students
    return quizzes.filter((q) => q.isPublished);
  }
}
