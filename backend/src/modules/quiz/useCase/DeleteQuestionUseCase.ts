import type { IQuizRepository } from "../interface/IQuizRepository";
import type { IQuestionRepository } from "../interface/IQuestionRepository";
import { CourseModel } from "../../course/repository/database/Course";

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

    if (!questionId) throw new Error("Question ID is required.");

    const question = await this.questionRepository.findById(questionId);
    if (!question) throw new Error("Question not found.");

    const quiz = await this.quizRepository.findById(question.quizId);
    if (!quiz) throw new Error("Parent quiz not found.");

    if (userRole !== "admin" && quiz.createdBy !== userId) {
      const course = await CourseModel.findOne({ id: quiz.courseId });
      if (!course || course.createdBy !== userId) {
        throw new Error("Unauthorized to delete this question.");
      }
    }

    return this.questionRepository.delete(questionId);
  }
}
