import type { IQuizRepository } from "../interface/IQuizRepository";
import type {
  IQuestionRepository,
  QuestionDto,
  UpdateQuestionParams,
} from "../interface/IQuestionRepository";
import { CourseModel } from "../../course/repository/database/Course";

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

    if (!questionId) throw new Error("Question ID is required.");

    const question = await this.questionRepository.findById(questionId);
    if (!question) throw new Error("Question not found.");

    const quiz = await this.quizRepository.findById(question.quizId);
    if (!quiz) throw new Error("Parent quiz not found.");

    if (userRole !== "admin" && quiz.createdBy !== userId) {
      const course = await CourseModel.findOne({ id: quiz.courseId });
      if (!course || course.createdBy !== userId) {
        throw new Error("Unauthorized to update this question.");
      }
    }

    if (fields.options && fields.correctOptionIds) {
      const optionIdsSet = new Set(fields.options.map((o) => o.id));
      for (const cid of fields.correctOptionIds) {
        if (!optionIdsSet.has(cid)) {
          throw new Error(`Correct option ID '${cid}' does not match any provided option.`);
        }
      }
    }

    const updated = await this.questionRepository.update(questionId, fields);
    if (!updated) throw new Error("Failed to update question.");
    return updated;
  }
}
