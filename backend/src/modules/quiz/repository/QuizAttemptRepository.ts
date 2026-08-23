import { randomUUID } from "crypto";
import { QuizAttemptModel } from "../database/QuizAttempt";
import type {
  IQuizAttemptRepository,
  QuizAttemptDto,
  CreateAttemptParams,
  SubmitAttemptParams,
} from "../interface/IQuizAttemptRepository";

export class QuizAttemptRepository implements IQuizAttemptRepository {
  private toDto(doc: any): QuizAttemptDto {
    return {
      id: doc.id,
      quizId: doc.quizId,
      courseId: doc.courseId,
      studentId: doc.studentId,
      attemptNumber: doc.attemptNumber,
      answers: doc.answers ?? [],
      startedAt: doc.startedAt,
      submittedAt: doc.submittedAt ?? null,
      score: doc.score ?? 0,
      totalPoints: doc.totalPoints ?? 0,
      percentage: doc.percentage ?? 0,
      passed: Boolean(doc.passed),
      status: doc.status,
      timeSpentSeconds: doc.timeSpentSeconds ?? 0,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async create(params: CreateAttemptParams): Promise<QuizAttemptDto> {
    const doc = await QuizAttemptModel.create({
      id: randomUUID(),
      ...params,
      status: "in_progress",
      startedAt: new Date(),
    });
    return this.toDto(doc);
  }

  async findById(attemptId: string): Promise<QuizAttemptDto | null> {
    const doc = await QuizAttemptModel.findOne({ id: attemptId });
    if (!doc) return null;
    return this.toDto(doc);
  }

  async findInProgress(studentId: string, quizId: string): Promise<QuizAttemptDto | null> {
    const doc = await QuizAttemptModel.findOne({
      studentId,
      quizId,
      status: "in_progress",
    });
    if (!doc) return null;
    return this.toDto(doc);
  }

  async findByStudentAndQuiz(studentId: string, quizId: string): Promise<QuizAttemptDto[]> {
    const docs = await QuizAttemptModel.find({ studentId, quizId }).sort({ createdAt: -1 });
    return docs.map((d) => this.toDto(d));
  }

  async findByQuizId(quizId: string): Promise<QuizAttemptDto[]> {
    const docs = await QuizAttemptModel.find({ quizId }).sort({ createdAt: -1 });
    return docs.map((d) => this.toDto(d));
  }

  async countByStudentAndQuiz(studentId: string, quizId: string): Promise<number> {
    return QuizAttemptModel.countDocuments({ studentId, quizId });
  }

  async submit(attemptId: string, params: SubmitAttemptParams): Promise<QuizAttemptDto | null> {
    const doc = await QuizAttemptModel.findOneAndUpdate(
      { id: attemptId },
      { $set: params },
      { new: true, runValidators: true },
    );
    if (!doc) return null;
    return this.toDto(doc);
  }

  async deleteByQuizId(quizId: string): Promise<number> {
    const result = await QuizAttemptModel.deleteMany({ quizId });
    return result.deletedCount;
  }
}
