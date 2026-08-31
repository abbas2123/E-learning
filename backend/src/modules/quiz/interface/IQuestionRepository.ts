export interface QuestionOptionDto {
  id: string;
  text: string;
}

// Safe DTO: no correctOptionIds — for student-facing responses
export interface QuestionDto {
  id: string;
  quizId: string;
  courseId: string;
  questionText: string;
  questionType: "single_choice" | "multiple_choice" | "true_false";
  options: QuestionOptionDto[];
  points: number;
  order: number;
  explanation: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Internal DTO: includes correct answers — for grading engine ONLY
export interface QuestionWithAnswersDto extends QuestionDto {
  correctOptionIds: string[];
}

export interface CreateQuestionParams {
  quizId: string;
  courseId: string;
  questionText: string;
  questionType?: "single_choice" | "multiple_choice" | "true_false";
  options: QuestionOptionDto[];
  correctOptionIds: string[];
  points?: number;
  order?: number;
  explanation?: string | null;
}

export interface UpdateQuestionParams {
  questionText?: string;
  questionType?: "single_choice" | "multiple_choice" | "true_false";
  options?: QuestionOptionDto[];
  correctOptionIds?: string[];
  points?: number;
  order?: number;
  explanation?: string | null;
}

export interface IQuestionRepository {
  create(params: CreateQuestionParams): Promise<QuestionDto>;
  findById(questionId: string): Promise<QuestionDto | null>;
  // Internal: returns correctOptionIds for grading
  findByIdWithAnswers(questionId: string): Promise<QuestionWithAnswersDto | null>;
  findByQuizId(quizId: string): Promise<QuestionDto[]>;
  // Internal: returns correctOptionIds for grading
  findByQuizIdWithAnswers(quizId: string): Promise<QuestionWithAnswersDto[]>;
  update(questionId: string, params: UpdateQuestionParams): Promise<QuestionDto | null>;
  delete(questionId: string): Promise<boolean>;
  deleteByQuizId(quizId: string): Promise<number>;
  reorderQuestions(quizId: string, orderedQuestionIds: string[]): Promise<QuestionDto[]>;
  getMaxOrder(quizId: string): Promise<number>;
  /** Returns a map of quizId → question count for the given quiz IDs */
  getQuestionCountsByQuizIds(quizIds: string[]): Promise<Map<string, number>>;
}
