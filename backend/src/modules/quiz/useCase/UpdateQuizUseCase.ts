import type { IQuizRepository, QuizDto, UpdateQuizParams } from "../interface/IQuizRepository";
import { CourseModel } from "../../course/repository/database/Course";

export interface UpdateQuizInput extends UpdateQuizParams {
  quizId: string;
  userId: string;
  userRole?: string;
}

export class UpdateQuizUseCase {
  constructor(private readonly quizRepository: IQuizRepository) {}

  async execute(input: UpdateQuizInput): Promise<QuizDto> {
    const { quizId, userId, userRole, ...fields } = input;

    if (!quizId) throw new Error("Quiz ID is required.");

    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) throw new Error("Quiz not found.");

    if (userRole !== "admin" && quiz.createdBy !== userId) {
      const course = await CourseModel.findOne({ id: quiz.courseId });
      if (!course || course.createdBy !== userId) {
        throw new Error("Unauthorized: only the course creator or admin can update quizzes.");
      }
    }

    if (fields.passingScore !== undefined && (fields.passingScore < 0 || fields.passingScore > 100)) {
      throw new Error("Passing score must be between 0 and 100.");
    }

    const updated = await this.quizRepository.update(quizId, fields);
    if (!updated) throw new Error("Failed to update quiz.");
    return updated;
  }
}
