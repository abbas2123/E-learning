export interface QuizDto {
  id: string;
  courseId: string;
  lessonId: string | null;
  title: string;
  description: string | null;
  instructions: string | null;
  timeLimitSeconds: number;
  passingScore: number;
  maxAttempts: number | null;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  isPublished: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateQuizParams {
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
  createdBy: string;
}

export interface UpdateQuizParams {
  title?: string;
  description?: string | null;
  instructions?: string | null;
  timeLimitSeconds?: number;
  passingScore?: number;
  maxAttempts?: number | null;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  isPublished?: boolean;
  lessonId?: string | null;
}

export interface IQuizRepository {
  create(params: CreateQuizParams): Promise<QuizDto>;
  findById(quizId: string): Promise<QuizDto | null>;
  findByCourseId(courseId: string): Promise<QuizDto[]>;
  findByLessonId(lessonId: string): Promise<QuizDto | null>;
  update(quizId: string, params: UpdateQuizParams): Promise<QuizDto | null>;
  delete(quizId: string): Promise<boolean>;
}
