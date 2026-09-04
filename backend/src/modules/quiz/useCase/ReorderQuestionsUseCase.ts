import type { IQuizRepository } from "../interface/IQuizRepository";
import type { IQuestionRepository, QuestionDto } from "../interface/IQuestionRepository";
import { CourseModel } from "../../course/repository/database/Course";
import { ForbiddenError, NotFoundError, ValidationError } from "../../../core/errors/AppError";

export interface ReorderQuestionsInput {
  quizId: string;
  orderedQuestionIds: string[];
  userId: string;
  userRole?: string;
}

export class ReorderQuestionsUseCase {
  constructor(
    private readonly quizRepository: IQuizRepository,
    private readonly questionRepository: IQuestionRepository,
  ) {}

  async execute(input: ReorderQuestionsInput): Promise<QuestionDto[]> {
    const { quizId, orderedQuestionIds, userId, userRole } = input;

    if (!quizId) throw new ValidationError("Quiz ID is required.");
    if (!Array.isArray(orderedQuestionIds) || orderedQuestionIds.length === 0) {
      throw new ValidationError("Ordered question IDs array is required.");
    }

    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) throw new NotFoundError("Quiz not found.", "QUIZ_NOT_FOUND");

    if (userRole !== "admin" && quiz.createdBy !== userId) {
      const course = await CourseModel.findOne({ id: quiz.courseId });
      if (!course || course.createdBy !== userId) {
        throw new ForbiddenError("You are not allowed to reorder this quiz.");
      }
    }

    return this.questionRepository.reorderQuestions(quizId, orderedQuestionIds);
  }
}
