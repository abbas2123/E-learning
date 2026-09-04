import type { IQuizRepository } from "../interface/IQuizRepository";
import type {
  IQuestionRepository,
  QuestionDto,
  QuestionOptionDto,
  CreateQuestionParams,
} from "../interface/IQuestionRepository";
import { CourseModel } from "../../course/repository/database/Course";
import { ForbiddenError, NotFoundError, ValidationError } from "../../../core/errors/AppError";

export interface CreateQuestionInput {
  quizId: string;
  questionText: string;
  questionType?: "single_choice" | "multiple_choice" | "true_false";
  options: QuestionOptionDto[];
  correctOptionIds: string[];
  points?: number;
  explanation?: string | null;
  userId: string;
  userRole?: string;
}

export class CreateQuestionUseCase {
  constructor(
    private readonly quizRepository: IQuizRepository,
    private readonly questionRepository: IQuestionRepository,
  ) {}

  async execute(input: CreateQuestionInput): Promise<QuestionDto> {
    const {
      quizId, questionText, questionType, options, correctOptionIds,
      points, explanation, userId, userRole,
    } = input;

    if (!quizId) throw new ValidationError("Quiz ID is required.");
    if (!questionText?.trim()) throw new ValidationError("Question text is required.");
    if (!Array.isArray(options) || options.length < 2) {
      throw new ValidationError("Question must have at least 2 options.");
    }
    if (!Array.isArray(correctOptionIds) || correctOptionIds.length === 0) {
      throw new ValidationError("At least one correct option ID is required.");
    }

    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) throw new NotFoundError("Parent quiz not found.", "QUIZ_NOT_FOUND");

    if (userRole !== "admin" && quiz.createdBy !== userId) {
      const course = await CourseModel.findOne({ id: quiz.courseId });
      if (!course || course.createdBy !== userId) {
        throw new ForbiddenError("You are not allowed to add questions to this quiz.");
      }
    }

    // Validate that all correctOptionIds refer to option IDs present in options array
    const optionIdsSet = new Set(options.map((o) => o.id));
    for (const cid of correctOptionIds) {
      if (!optionIdsSet.has(cid)) {
        throw new ValidationError("Each correct option must match a provided option.");
      }
    }

    const maxOrder = await this.questionRepository.getMaxOrder(quizId);

    const params: CreateQuestionParams = {
      quizId,
      courseId: quiz.courseId,
      questionText: questionText.trim(),
      questionType: questionType || "single_choice",
      options,
      correctOptionIds,
      points: points && points > 0 ? points : 1,
      order: maxOrder + 1,
      explanation: explanation ?? null,
    };

    return this.questionRepository.create(params);
  }
}
