import type { IQuizRepository } from "../interface/IQuizRepository";
import type {
  IQuestionRepository,
  QuestionDto,
  UpdateQuestionParams,
} from "../interface/IQuestionRepository";
import { CourseModel } from "../../course/repository/database/Course";
import { ForbiddenError, NotFoundError, ValidationError } from "../../../core/errors/AppError";

export interface UpdateQuestionInput extends UpdateQuestionParams {
  questionId: string;
  userId: string;
  userRole?: string;
}

export class UpdateQuestionUseCase {
  constructor(
    private readonly quizRepository: IQuizRepository,
    private readonly questionRepository: IQuestionRepository,
  ) {}

  async execute(input: UpdateQuestionInput): Promise<QuestionDto> {
    const { questionId, userId, userRole, ...fields } = input;

    if (!questionId) throw new ValidationError("Question ID is required.");

    const question = await this.questionRepository.findById(questionId);
    if (!question) throw new NotFoundError("Question not found.", "QUESTION_NOT_FOUND");

    const quiz = await this.quizRepository.findById(question.quizId);
    if (!quiz) throw new NotFoundError("Parent quiz not found.", "QUIZ_NOT_FOUND");

    if (userRole !== "admin" && quiz.createdBy !== userId) {
      const course = await CourseModel.findOne({ id: quiz.courseId });
      if (!course || course.createdBy !== userId) {
        throw new ForbiddenError("You are not allowed to update this question.");
      }
    }

    if (fields.options && fields.correctOptionIds) {
      const optionIdsSet = new Set(fields.options.map((o) => o.id));
      for (const cid of fields.correctOptionIds) {
        if (!optionIdsSet.has(cid)) {
          throw new ValidationError("Each correct option must match a provided option.");
        }
      }
    }

    const updated = await this.questionRepository.update(questionId, fields);
    if (!updated) throw new Error("Failed to update question.");
    return updated;
  }
}
