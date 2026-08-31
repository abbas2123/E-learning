import { QuizRepository } from "../repository/QuizRepository";
import { QuestionRepository } from "../repository/QuestionRepository";
import { QuizAttemptRepository } from "../repository/QuizAttemptRepository";

import { LessonProgressRepository } from "../../progress/repository/LessonProgressRepository";
import { LessonRepository } from "../../curriculum/repository/LessonRepository";
import { CourseRepository } from "../../course/repository/repository/CourseRepository";
import { EnrollmentRepository } from "../../admin/Repository/repository/EnrollmentRepository";
import { MarkLessonCompleteUseCase } from "../../progress/useCase/MarkLessonCompleteUseCase";

import { CreateQuizUseCase } from "../useCase/CreateQuizUseCase";
import { UpdateQuizUseCase } from "../useCase/UpdateQuizUseCase";
import { DeleteQuizUseCase } from "../useCase/DeleteQuizUseCase";
import { GetQuizUseCase } from "../useCase/GetQuizUseCase";
import { GetCourseQuizzesUseCase } from "../useCase/GetCourseQuizzesUseCase";

import { CreateQuestionUseCase } from "../useCase/CreateQuestionUseCase";
import { UpdateQuestionUseCase } from "../useCase/UpdateQuestionUseCase";
import { DeleteQuestionUseCase } from "../useCase/DeleteQuestionUseCase";
import { ReorderQuestionsUseCase } from "../useCase/ReorderQuestionsUseCase";

import { StartQuizAttemptUseCase } from "../useCase/StartQuizAttemptUseCase";
import { SubmitQuizAttemptUseCase } from "../useCase/SubmitQuizAttemptUseCase";
import { GetQuizAttemptsUseCase } from "../useCase/GetQuizAttemptsUseCase";
import { GetQuizResultUseCase } from "../useCase/GetQuizResultUseCase";

import { QuizController } from "../controller/QuizController";

export function createQuizContainer() {
  const quizRepository = new QuizRepository();
  const questionRepository = new QuestionRepository();
  const attemptRepository = new QuizAttemptRepository();
  const lessonRepository = new LessonRepository();
  const courseRepository = new CourseRepository();
  const enrollmentRepository = new EnrollmentRepository();

  const progressRepository = new LessonProgressRepository();
  const markLessonCompleteUseCase = new MarkLessonCompleteUseCase(
    progressRepository,
    courseRepository,
    lessonRepository,
    enrollmentRepository,
  );

  const createQuizUseCase = new CreateQuizUseCase(quizRepository);
  const updateQuizUseCase = new UpdateQuizUseCase(quizRepository);
  const deleteQuizUseCase = new DeleteQuizUseCase(quizRepository, questionRepository, attemptRepository);
  const getQuizUseCase = new GetQuizUseCase(quizRepository, questionRepository);
  const getCourseQuizzesUseCase = new GetCourseQuizzesUseCase(quizRepository);

  const createQuestionUseCase = new CreateQuestionUseCase(quizRepository, questionRepository);
  const updateQuestionUseCase = new UpdateQuestionUseCase(quizRepository, questionRepository);
  const deleteQuestionUseCase = new DeleteQuestionUseCase(quizRepository, questionRepository);
  const reorderQuestionsUseCase = new ReorderQuestionsUseCase(quizRepository, questionRepository);

  const startQuizAttemptUseCase = new StartQuizAttemptUseCase(
    quizRepository,
    questionRepository,
    attemptRepository,
  );
  const submitQuizAttemptUseCase = new SubmitQuizAttemptUseCase(
    quizRepository,
    questionRepository,
    attemptRepository,
    markLessonCompleteUseCase,
    lessonRepository,
  );
  const getQuizAttemptsUseCase = new GetQuizAttemptsUseCase(quizRepository, attemptRepository);
  const getQuizResultUseCase = new GetQuizResultUseCase(
    quizRepository,
    questionRepository,
    attemptRepository,
  );

  const controller = new QuizController(
    createQuizUseCase,
    updateQuizUseCase,
    deleteQuizUseCase,
    getQuizUseCase,
    getCourseQuizzesUseCase,

    createQuestionUseCase,
    updateQuestionUseCase,
    deleteQuestionUseCase,
    reorderQuestionsUseCase,

    startQuizAttemptUseCase,
    submitQuizAttemptUseCase,
    getQuizAttemptsUseCase,
    getQuizResultUseCase,
  );

  return { controller };
}
