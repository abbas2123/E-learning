export interface AnswerDto {
  questionId: string;
  selectedOptionIds: string[];
}

export interface QuizAttemptDto {
  id: string;
  quizId: string;
  courseId: string;
  studentId: string;
  attemptNumber: number;
  answers: AnswerDto[];
  startedAt: Date;
  submittedAt: Date | null;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  status: "in_progress" | "submitted" | "expired";
  timeSpentSeconds: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAttemptParams {
  quizId: string;
  courseId: string;
  studentId: string;
  attemptNumber: number;
}

export interface SubmitAttemptParams {
  answers: AnswerDto[];
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  status: "submitted" | "expired";
  submittedAt: Date;
  timeSpentSeconds: number;
}

export interface IQuizAttemptRepository {
  create(params: CreateAttemptParams): Promise<QuizAttemptDto>;
  findById(attemptId: string): Promise<QuizAttemptDto | null>;
  findInProgress(studentId: string, quizId: string): Promise<QuizAttemptDto | null>;
  findByStudentAndQuiz(studentId: string, quizId: string): Promise<QuizAttemptDto[]>;
  findByQuizId(quizId: string): Promise<QuizAttemptDto[]>;
  countByStudentAndQuiz(studentId: string, quizId: string): Promise<number>;
  submit(attemptId: string, params: SubmitAttemptParams): Promise<QuizAttemptDto | null>;
  deleteByQuizId(quizId: string): Promise<number>;
}
