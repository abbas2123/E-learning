import type { IQuizRepository, QuizDto } from "../interface/IQuizRepository";
import type {
  IQuestionRepository,
  QuestionDto,
} from "../interface/IQuestionRepository";
import type { ICourseRepository } from "../../course/interface/ICourseRepository";
import { CourseModel } from "../../course/repository/database/Course";
import { NotFoundError, QuizUnavailableError, ValidationError } from "../../../core/errors/AppError";
import mongoose from "mongoose";

export interface GetQuizInput {
  quizId: string;
  userId?: string;
  userRole?: string;
}

export interface QuizWithQuestionsResponse {
  quiz: QuizDto;
  questions: QuestionDto[];
  totalQuestions: number;
  totalPoints: number;
}

export class GetQuizUseCase {
  constructor(
    private readonly quizRepository: IQuizRepository,
    private readonly questionRepository: IQuestionRepository,
    private readonly courseRepository?: ICourseRepository,
  ) {}

  async execute(input: GetQuizInput): Promise<QuizWithQuestionsResponse> {
    const { quizId, userId, userRole } = input;

    if (!quizId) throw new ValidationError("Quiz ID is required.");

    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) throw new NotFoundError("Quiz not found.", "QUIZ_NOT_FOUND");

    const isOwnerOrAdmin =
      userRole === "admin" || (userId && quiz.createdBy === userId);

    if (!quiz.isPublished && !isOwnerOrAdmin) {
      if (this.courseRepository) {
        const course = await this.courseRepository.findSummaryById(quiz.courseId);
        if (!course || course.createdBy !== userId) {
          throw new QuizUnavailableError();
        }
      } else if (mongoose.connection.readyState === 1) {
        const course = await CourseModel.findOne({ id: quiz.courseId });
        if (!course || course.createdBy !== userId) {
          throw new QuizUnavailableError();
        }
      } else {
        throw new QuizUnavailableError();
      }
    }

    // QuestionRepository.findByQuizId ALWAYS strips correctOptionIds for safety
    const questions = await this.questionRepository.findByQuizId(quizId);
    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 1), 0);

    return {
      quiz,
      questions,
      totalQuestions: questions.length,
      totalPoints,
    };
  }
}
