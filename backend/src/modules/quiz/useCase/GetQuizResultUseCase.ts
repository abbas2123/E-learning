import type { IQuizRepository, QuizDto } from "../interface/IQuizRepository";
import type { IQuestionRepository, QuestionWithAnswersDto } from "../interface/IQuestionRepository";
import type { IQuizAttemptRepository, QuizAttemptDto } from "../interface/IQuizAttemptRepository";
import { CourseModel } from "../../course/repository/database/Course";
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from "../../../core/errors/AppError";

export interface GetQuizResultInput {
  attemptId: string;
  userId: string;
  userRole?: string;
}

export interface QuizResultResponse {
  attempt: QuizAttemptDto;
  quiz: QuizDto;
  questions: QuestionWithAnswersDto[];
}

export class GetQuizResultUseCase {
  constructor(
    private readonly quizRepository: IQuizRepository,
    private readonly questionRepository: IQuestionRepository,
    private readonly attemptRepository: IQuizAttemptRepository,
  ) {}

  async execute(input: GetQuizResultInput): Promise<QuizResultResponse> {
    const { attemptId, userId, userRole } = input;

    if (!attemptId) throw new ValidationError("Attempt ID is required.");
    if (!userId) throw new UnauthorizedError();

    const attempt = await this.attemptRepository.findById(attemptId);
    if (!attempt) throw new NotFoundError("Quiz attempt not found.", "QUIZ_ATTEMPT_NOT_FOUND");

    const quiz = await this.quizRepository.findById(attempt.quizId);
    if (!quiz) throw new NotFoundError("Quiz not found.", "QUIZ_NOT_FOUND");

    const isOwnerOrAdmin =
      userRole === "admin" || quiz.createdBy === userId;

    if (!isOwnerOrAdmin && attempt.studentId !== userId) {
      const course = await CourseModel.findOne({ id: quiz.courseId });
      if (course?.createdBy !== userId) {
        throw new ForbiddenError("You are not allowed to view this attempt result.");
      }
    }

    if (attempt.status === "in_progress") {
      throw new ConflictError("Attempt is still in progress. Submit it first to see results.", "RESOURCE_CONFLICT");
    }

    // Include explanations & correctOptionIds ONLY for submitted/expired attempt results
    const questions = await this.questionRepository.findByQuizIdWithAnswers(quiz.id);

    return {
      attempt,
      quiz,
      questions,
    };
  }
}
