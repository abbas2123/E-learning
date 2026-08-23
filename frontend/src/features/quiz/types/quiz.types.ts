export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  courseId: string;
  questionText: string;
  questionType: "single_choice" | "multiple_choice" | "true_false";
  options: QuizOption[];
  points: number;
  order: number;
  explanation?: string | null;
  // Included ONLY in graded result views
  correctOptionIds?: string[];
}

export interface Quiz {
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
  createdAt: string;
  updatedAt: string;
}

export interface AnswerPayload {
  questionId: string;
  selectedOptionIds: string[];
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  courseId: string;
  studentId: string;
  attemptNumber: number;
  answers: AnswerPayload[];
  startedAt: string;
  submittedAt: string | null;
  score: number;
  totalPoints: number;
  percentage: number;
  passed: boolean;
  status: "in_progress" | "submitted" | "expired";
  timeSpentSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface StartQuizResponse {
  attempt: QuizAttempt;
  quiz: Quiz;
  questions: QuizQuestion[];
}

export interface SubmitQuizResponse {
  attempt: QuizAttempt;
  lessonMarkedComplete: boolean;
}

export interface QuizResultDetails {
  attempt: QuizAttempt;
  quiz: Quiz;
  questions: QuizQuestion[];
}
