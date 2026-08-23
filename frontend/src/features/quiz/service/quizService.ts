import apiClient from "../../../services/apiClient";
import type {
  Quiz,
  StartQuizResponse,
  SubmitQuizResponse,
  QuizAttempt,
  QuizResultDetails,
  AnswerPayload,
} from "../types/quiz.types";

export const getCourseQuizzes = async (courseId: string): Promise<Quiz[]> => {
  const response = await apiClient.get(`/api/courses/${courseId}/quizzes`);
  return response.data.data;
};

export const getQuiz = async (quizId: string) => {
  const response = await apiClient.get(`/api/quizzes/${quizId}`);
  return response.data.data;
};

export const startAttempt = async (quizId: string): Promise<StartQuizResponse> => {
  const response = await apiClient.post(`/api/quizzes/${quizId}/start`);
  return response.data.data;
};

export const submitAttempt = async (
  attemptId: string,
  answers: AnswerPayload[],
): Promise<SubmitQuizResponse> => {
  const response = await apiClient.post(`/api/quiz-attempts/${attemptId}/submit`, {
    answers,
  });
  return response.data.data;
};

export const getAttempts = async (quizId: string): Promise<QuizAttempt[]> => {
  const response = await apiClient.get(`/api/quizzes/${quizId}/attempts`);
  return response.data.data;
};

export const getAttemptResult = async (
  attemptId: string,
): Promise<QuizResultDetails> => {
  const response = await apiClient.get(`/api/quiz-attempts/${attemptId}`);
  return response.data.data;
};

const quizService = {
  getCourseQuizzes,
  getQuiz,
  startAttempt,
  submitAttempt,
  getAttempts,
  getAttemptResult,
};

export default quizService;
