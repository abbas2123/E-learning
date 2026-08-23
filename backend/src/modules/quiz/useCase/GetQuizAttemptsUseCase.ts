import type { IQuizRepository } from "../interface/IQuizRepository";
import type { IQuizAttemptRepository, QuizAttemptDto } from "../interface/IQuizAttemptRepository";
import { CourseModel } from "../../course/repository/database/Course";

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

    if (!quizId) throw new Error("Quiz ID is required.");
    if (!userId) throw new Error("User ID is required.");

    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) throw new Error("Quiz not found.");

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
