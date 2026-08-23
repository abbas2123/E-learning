import type { IQuizRepository } from "../interface/IQuizRepository";
import type { IQuestionRepository } from "../interface/IQuestionRepository";
import type { IQuizAttemptRepository, QuizAttemptDto, AnswerDto } from "../interface/IQuizAttemptRepository";
import type { MarkLessonCompleteUseCase } from "../../progress/useCase/MarkLessonCompleteUseCase";

export interface SubmitQuizAttemptInput {
  attemptId: string;
  answers: AnswerDto[];
  userId: string;
}

export interface SubmitQuizAttemptResult {
  attempt: QuizAttemptDto;
  lessonMarkedComplete: boolean;
}

export class SubmitQuizAttemptUseCase {
  constructor(
    private readonly quizRepository: IQuizRepository,
    private readonly questionRepository: IQuestionRepository,
    private readonly attemptRepository: IQuizAttemptRepository,
    private readonly markLessonCompleteUseCase?: MarkLessonCompleteUseCase,
  ) {}

  async execute(input: SubmitQuizAttemptInput): Promise<SubmitQuizAttemptResult> {
    const { attemptId, answers, userId } = input;

    if (!attemptId) throw new Error("Attempt ID is required.");
    if (!userId) throw new Error("User ID is required.");

    const attempt = await this.attemptRepository.findById(attemptId);
    if (!attempt) throw new Error("Quiz attempt not found.");

    if (attempt.studentId !== userId) {
      throw new Error("Unauthorized: this attempt belongs to another user.");
    }

    if (attempt.status !== "in_progress") {
      throw new Error("This attempt has already been submitted.");
    }

    const quiz = await this.quizRepository.findById(attempt.quizId);
    if (!quiz) throw new Error("Parent quiz not found.");

    // Check time limit with a 15-second grace period for network latency
    const now = new Date();
    const timeSpentSeconds = Math.max(0, Math.floor((now.getTime() - new Date(attempt.startedAt).getTime()) / 1000));
    const isExpired = quiz.timeLimitSeconds > 0 && timeSpentSeconds > (quiz.timeLimitSeconds + 15);

    // Fetch questions WITH correct answer IDs for grading
    const questions = await this.questionRepository.findByQuizIdWithAnswers(quiz.id);
    const questionMap = new Map(questions.map((q) => [q.id, q]));

    let score = 0;
    let totalPoints = 0;

    for (const q of questions) {
      totalPoints += q.points || 1;
    }

    const processedAnswers: AnswerDto[] = [];

    for (const userAns of answers || []) {
      const q = questionMap.get(userAns.questionId);
      if (!q) continue;

      const userSelected = Array.isArray(userAns.selectedOptionIds)
        ? userAns.selectedOptionIds
        : [];

      processedAnswers.push({
        questionId: q.id,
        selectedOptionIds: userSelected,
      });

      const correctSet = new Set(q.correctOptionIds);
      const userSet = new Set(userSelected);

      let isCorrect = false;

      if (q.questionType === "multiple_choice") {
        isCorrect =
          correctSet.size === userSet.size &&
          [...correctSet].every((id) => userSet.has(id));
      } else {
        // single_choice or true_false
        if (userSelected.length === 1 && correctSet.has(userSelected[0])) {
          isCorrect = true;
        }
      }

      if (isCorrect) {
        score += q.points || 1;
      }
    }

    const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;
    const passed = percentage >= quiz.passingScore;
    const status = isExpired ? "expired" : "submitted";

    const updatedAttempt = await this.attemptRepository.submit(attemptId, {
      answers: processedAnswers,
      score,
      totalPoints,
      percentage,
      passed,
      status,
      submittedAt: now,
      timeSpentSeconds,
    });

    if (!updatedAttempt) {
      throw new Error("Failed to submit quiz attempt.");
    }

    let lessonMarkedComplete = false;

    // Trigger lesson completion if quiz passed and quiz is associated with a lesson
    if (passed && quiz.lessonId && this.markLessonCompleteUseCase) {
      try {
        await this.markLessonCompleteUseCase.execute({
          userId,
          courseId: quiz.courseId,
          lessonId: quiz.lessonId,
        });
        lessonMarkedComplete = true;
      } catch (err) {
        console.error("Failed to auto-mark lesson complete after quiz pass:", err);
      }
    }

    return {
      attempt: updatedAttempt,
      lessonMarkedComplete,
    };
  }
}
