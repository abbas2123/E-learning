import type { IQuizRepository, QuizDto, UpdateQuizParams } from "../interface/IQuizRepository";
import { CourseModel } from "../../course/repository/database/Course";
import { ForbiddenError, NotFoundError, ValidationError } from "../../../core/errors/AppError";

export interface UpdateQuizInput extends UpdateQuizParams {
  quizId: string;
  userId: string;
  userRole?: string;
}

export class UpdateQuizUseCase {
  constructor(private readonly quizRepository: IQuizRepository) {}

  async execute(input: UpdateQuizInput): Promise<QuizDto> {
    const { quizId, userId, userRole, ...fields } = input;

    if (!quizId) throw new ValidationError("Quiz ID is required.");

    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) throw new NotFoundError("Quiz not found.", "QUIZ_NOT_FOUND");

    if (userRole !== "admin" && quiz.createdBy !== userId) {
      const course = await CourseModel.findOne({ id: quiz.courseId });
      if (!course || course.createdBy !== userId) {
        throw new ForbiddenError("You are not allowed to update this quiz.");
      }
    }

    if (fields.passingScore !== undefined && (fields.passingScore < 0 || fields.passingScore > 100)) {
      throw new ValidationError("Passing score must be between 0 and 100.");
    }

    const updated = await this.quizRepository.update(quizId, fields);
    if (!updated) throw new Error("Failed to update quiz.");
    return updated;
  }
}
