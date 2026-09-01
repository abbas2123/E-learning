import type { IQuizRepository, QuizDto } from "../interface/IQuizRepository";
import type {
  IQuestionRepository,
  QuestionDto,
} from "../interface/IQuestionRepository";
import { CourseModel } from "../../course/repository/database/Course";
import { NotFoundError, ValidationError } from "../../../core/errors/AppError";

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
  ) {}

  async execute(input: GetQuizInput): Promise<QuizWithQuestionsResponse> {
    const { quizId, userId, userRole } = input;

    if (!quizId) throw new ValidationError("Quiz ID is required.");

    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) throw new NotFoundError("Quiz not found.", "QUIZ_NOT_FOUND");

    const isOwnerOrAdmin =
      userRole === "admin" || (userId && quiz.createdBy === userId);

    if (!quiz.isPublished && !isOwnerOrAdmin) {
      const course = await CourseModel.findOne({ id: quiz.courseId });
      if (!course || course.createdBy !== userId) {
        throw new Error("Quiz is not available.");
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
