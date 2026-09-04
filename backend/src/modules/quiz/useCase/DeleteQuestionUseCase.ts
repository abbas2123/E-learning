import type { IQuizRepository } from "../interface/IQuizRepository";
import type { IQuestionRepository } from "../interface/IQuestionRepository";
import { CourseModel } from "../../course/repository/database/Course";
import { ForbiddenError, NotFoundError, ValidationError } from "../../../core/errors/AppError";

export interface DeleteQuestionInput {
  questionId: string;
  userId: string;
  userRole?: string;
}

export class DeleteQuestionUseCase {
  constructor(
    private readonly quizRepository: IQuizRepository,
    private readonly questionRepository: IQuestionRepository,
  ) {}

  async execute(input: DeleteQuestionInput): Promise<boolean> {
    const { questionId, userId, userRole } = input;

    if (!questionId) throw new ValidationError("Question ID is required.");

    const question = await this.questionRepository.findById(questionId);
    if (!question) throw new NotFoundError("Question not found.", "QUESTION_NOT_FOUND");

    const quiz = await this.quizRepository.findById(question.quizId);
    if (!quiz) throw new NotFoundError("Parent quiz not found.", "QUIZ_NOT_FOUND");

    if (userRole !== "admin" && quiz.createdBy !== userId) {
      const course = await CourseModel.findOne({ id: quiz.courseId });
      if (!course || course.createdBy !== userId) {
        throw new ForbiddenError("You are not allowed to delete this question.");
      }
    }

    return this.questionRepository.delete(questionId);
  }
}
