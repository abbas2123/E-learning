import type { IQuizRepository } from "../interface/IQuizRepository";
import type { IQuizAttemptRepository, QuizAttemptDto } from "../interface/IQuizAttemptRepository";
import { CourseModel } from "../../course/repository/database/Course";
import { NotFoundError, UnauthorizedError, ValidationError } from "../../../core/errors/AppError";

export interface GetQuizAttemptsInput {
  quizId: string;
  userId: string;
  userRole?: string;
}

export class GetQuizAttemptsUseCase {
  constructor(
    private readonly quizRepository: IQuizRepository,
    private readonly attemptRepository: IQuizAttemptRepository,
  ) {}

  async execute(input: GetQuizAttemptsInput): Promise<QuizAttemptDto[]> {
    const { quizId, userId, userRole } = input;

    if (!quizId) throw new ValidationError("Quiz ID is required.");
    if (!userId) throw new UnauthorizedError();

    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) throw new NotFoundError("Quiz not found.", "QUIZ_NOT_FOUND");

    const isOwnerOrAdmin =
      userRole === "admin" || quiz.createdBy === userId;

    if (!isOwnerOrAdmin) {
      const course = await CourseModel.findOne({ id: quiz.courseId });
      if (course?.createdBy === userId) {
        return this.attemptRepository.findByQuizId(quizId);
      }
      // Students can only see their own attempts
      return this.attemptRepository.findByStudentAndQuiz(userId, quizId);
    }

    // Admins and course creator see all attempts for this quiz
    return this.attemptRepository.findByQuizId(quizId);
  }
}
