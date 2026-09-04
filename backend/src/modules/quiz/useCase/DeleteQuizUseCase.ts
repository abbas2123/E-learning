import type { IQuizRepository } from "../interface/IQuizRepository";
import type { IQuestionRepository } from "../interface/IQuestionRepository";
import type { IQuizAttemptRepository } from "../interface/IQuizAttemptRepository";
import { CourseModel } from "../../course/repository/database/Course";
import { ForbiddenError, NotFoundError, ValidationError } from "../../../core/errors/AppError";

export interface DeleteQuizInput {
  quizId: string;
  userId: string;
  userRole?: string;
}

export class DeleteQuizUseCase {
  constructor(
    private readonly quizRepository: IQuizRepository,
    private readonly questionRepository: IQuestionRepository,
    private readonly attemptRepository: IQuizAttemptRepository,
  ) {}

  async execute(input: DeleteQuizInput): Promise<boolean> {
    const { quizId, userId, userRole } = input;

    if (!quizId) throw new ValidationError("Quiz ID is required.");

    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) throw new NotFoundError("Quiz not found.", "QUIZ_NOT_FOUND");

    if (userRole !== "admin" && quiz.createdBy !== userId) {
      const course = await CourseModel.findOne({ id: quiz.courseId });
      if (!course || course.createdBy !== userId) {
        throw new ForbiddenError("You are not allowed to delete this quiz.");
      }
    }

    // Cascade delete questions & attempts
    await this.questionRepository.deleteByQuizId(quizId);
    await this.attemptRepository.deleteByQuizId(quizId);
    return this.quizRepository.delete(quizId);
  }
}
