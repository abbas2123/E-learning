import type { IQuizRepository, QuizDto, CreateQuizParams } from "../interface/IQuizRepository";
import { CourseModel } from "../../course/repository/database/Course";
import { ForbiddenError, NotFoundError, ValidationError } from "../../../core/errors/AppError";

export interface CreateQuizInput {
  courseId: string;
  lessonId?: string | null;
  title: string;
  description?: string | null;
  instructions?: string | null;
  timeLimitSeconds?: number;
  passingScore?: number;
  maxAttempts?: number | null;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  userId: string;
  userRole?: string;
}

export class CreateQuizUseCase {
  constructor(private readonly quizRepository: IQuizRepository) {}

  async execute(input: CreateQuizInput): Promise<QuizDto> {
    const {
      courseId, lessonId, title, description, instructions,
      timeLimitSeconds, passingScore, maxAttempts,
      shuffleQuestions, shuffleOptions, userId, userRole,
    } = input;

    if (!courseId) throw new ValidationError("Course ID is required.");
    if (!title?.trim()) throw new ValidationError("Quiz title is required.");
    if (passingScore !== undefined && (passingScore < 0 || passingScore > 100)) {
      throw new ValidationError("Passing score must be between 0 and 100.");
    }

    const course = await CourseModel.findOne({ id: courseId });
    if (!course) throw new NotFoundError("Course not found.", "COURSE_NOT_FOUND");

    if (userRole !== "admin" && course.createdBy !== userId) {
      throw new ForbiddenError("You are not allowed to create quizzes for this course.");
    }

    const params: CreateQuizParams = {
      courseId,
      lessonId: lessonId ?? null,
      title: title.trim(),
      description: description ?? null,
      instructions: instructions ?? null,
      timeLimitSeconds: timeLimitSeconds ?? 0,
      passingScore: passingScore ?? 70,
      maxAttempts: maxAttempts ?? null,
      shuffleQuestions: Boolean(shuffleQuestions),
      shuffleOptions: Boolean(shuffleOptions),
      createdBy: userId,
    };

    return this.quizRepository.create(params);
  }
}
