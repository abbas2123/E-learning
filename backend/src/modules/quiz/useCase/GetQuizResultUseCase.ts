import type { IQuizRepository, QuizDto } from "../interface/IQuizRepository";
import type { IQuestionRepository, QuestionWithAnswersDto } from "../interface/IQuestionRepository";
import type { IQuizAttemptRepository, QuizAttemptDto } from "../interface/IQuizAttemptRepository";
import { CourseModel } from "../../course/repository/database/Course";

export interface GetQuizResultInput {
  attemptId: string;
  userId: string;
  userRole?: string;
}

export interface QuizResultResponse {
  attempt: QuizAttemptDto;
  quiz: QuizDto;
  questions: QuestionWithAnswersDto[];
}

export class GetQuizResultUseCase {
  constructor(
    private readonly quizRepository: IQuizRepository,
    private readonly questionRepository: IQuestionRepository,
    private readonly attemptRepository: IQuizAttemptRepository,
  ) {}

  async execute(input: GetQuizResultInput): Promise<QuizResultResponse> {
    const { attemptId, userId, userRole } = input;

    if (!attemptId) throw new Error("Attempt ID is required.");
    if (!userId) throw new Error("User ID is required.");

    const attempt = await this.attemptRepository.findById(attemptId);
    if (!attempt) throw new Error("Quiz attempt not found.");

    const quiz = await this.quizRepository.findById(attempt.quizId);
    if (!quiz) throw new Error("Quiz not found.");

    const isOwnerOrAdmin =
      userRole === "admin" || quiz.createdBy === userId;

    if (!isOwnerOrAdmin && attempt.studentId !== userId) {
      const course = await CourseModel.findOne({ id: quiz.courseId });
      if (course?.createdBy !== userId) {
        throw new Error("Unauthorized to view this attempt result.");
      }
    }

    if (attempt.status === "in_progress") {
      throw new Error("Attempt is still in progress. Submit it first to see results.");
    }

    // Include explanations & correctOptionIds ONLY for submitted/expired attempt results
    const questions = await this.questionRepository.findByQuizIdWithAnswers(quiz.id);

    return {
      attempt,
      quiz,
      questions,
    };
  }
}
