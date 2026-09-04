import type { IQuizRepository, QuizDto } from "../interface/IQuizRepository";
import type { IQuestionRepository, QuestionDto } from "../interface/IQuestionRepository";
import type { IQuizAttemptRepository, QuizAttemptDto } from "../interface/IQuizAttemptRepository";
import { EnrollmentModel } from "../../admin/Repository/database/Enrollment";
import { CourseModel } from "../../course/repository/database/Course";
import {
  AttemptLimitReachedError,
  EnrollmentRequiredError,
  NotFoundError,
  QuizNotReadyError,
  QuizUnavailableError,
  UnauthorizedError,
  ValidationError,
} from "../../../core/errors/AppError";

export interface StartQuizAttemptInput {
  quizId: string;
  userId: string;
  userRole?: string;
}

export interface StartQuizAttemptResponse {
  attempt: QuizAttemptDto;
  quiz: QuizDto;
  questions: QuestionDto[];
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export class StartQuizAttemptUseCase {
  constructor(
    private readonly quizRepository: IQuizRepository,
    private readonly questionRepository: IQuestionRepository,
    private readonly attemptRepository: IQuizAttemptRepository,
  ) {}

  async execute(input: StartQuizAttemptInput): Promise<StartQuizAttemptResponse> {
    const { quizId, userId, userRole } = input;

    if (!quizId) throw new ValidationError("Quiz ID is required.");
    if (!userId) throw new UnauthorizedError();

    const quiz = await this.quizRepository.findById(quizId);
    if (!quiz) throw new NotFoundError("Quiz not found.", "QUIZ_NOT_FOUND");

    const isOwnerOrAdmin =
      userRole === "admin" || (userId && quiz.createdBy === userId);

    if (!quiz.isPublished && !isOwnerOrAdmin) {
      throw new QuizUnavailableError("This quiz is not currently published.");
    }

    // Verify enrollment
    if (!isOwnerOrAdmin) {
      const enrollment = await EnrollmentModel.findOne({
        studentId: userId,
        courseId: quiz.courseId,
        status: "completed",
      });
      if (!enrollment) {
        throw new EnrollmentRequiredError("You must be enrolled in this course to take quizzes.");
      }
    }

    // Check if an attempt is already in progress
    const existingInProgress = await this.attemptRepository.findInProgress(userId, quizId);
    let questions = await this.questionRepository.findByQuizId(quizId);

    if (questions.length === 0) {
      throw new QuizNotReadyError("This quiz has no questions yet.");
    }

    if (quiz.shuffleQuestions) {
      questions = shuffleArray(questions);
    }
    if (quiz.shuffleOptions) {
      questions = questions.map((q) => ({
        ...q,
        options: shuffleArray(q.options),
      }));
    }

    if (existingInProgress) {
      return {
        attempt: existingInProgress,
        quiz,
        questions,
      };
    }

    // Check max attempt limits
    if (quiz.maxAttempts !== null && quiz.maxAttempts > 0) {
      const attemptCount = await this.attemptRepository.countByStudentAndQuiz(userId, quizId);
      if (attemptCount >= quiz.maxAttempts) {
        throw new AttemptLimitReachedError(`Maximum attempt limit reached (${quiz.maxAttempts} attempts allowed).`);
      }
    }

    const previousAttempts = await this.attemptRepository.findByStudentAndQuiz(userId, quizId);
    const attemptNumber = previousAttempts.length + 1;

    const attempt = await this.attemptRepository.create({
      quizId,
      courseId: quiz.courseId,
      studentId: userId,
      attemptNumber,
    });

    return {
      attempt,
      quiz,
      questions,
    };
  }
}
