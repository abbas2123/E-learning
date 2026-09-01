import { randomUUID } from "crypto";
import { QuizModel } from "../database/Quiz";
import type {
  IQuizRepository,
  QuizDto,
  CreateQuizParams,
  UpdateQuizParams,
} from "../interface/IQuizRepository";

export class QuizRepository implements IQuizRepository {
  private toDto(doc: any): QuizDto {
    return {
      id: doc.id,
      courseId: doc.courseId,
      lessonId: doc.lessonId ?? null,
      title: doc.title,
      description: doc.description ?? null,
      instructions: doc.instructions ?? null,
      timeLimitSeconds: doc.timeLimitSeconds ?? 0,
      passingScore: doc.passingScore ?? 70,
      maxAttempts: doc.maxAttempts ?? null,
      shuffleQuestions: Boolean(doc.shuffleQuestions),
      shuffleOptions: Boolean(doc.shuffleOptions),
      isPublished: Boolean(doc.isPublished),
      createdBy: doc.createdBy,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async create(params: CreateQuizParams): Promise<QuizDto> {
    const doc = await QuizModel.create({
      id: randomUUID(),
      ...params,
    });
    return this.toDto(doc);
  }

  async findById(quizId: string): Promise<QuizDto | null> {
    const doc = await QuizModel.findOne({
      $or: [{ id: quizId }, { lessonId: quizId }],
    });
    if (!doc) return null;
    return this.toDto(doc);
  }

  async findByCourseId(courseId: string): Promise<QuizDto[]> {
    const docs = await QuizModel.find({ courseId }).sort({ createdAt: 1 });
    return docs.map((d) => this.toDto(d));
  }

  async findByLessonId(lessonId: string): Promise<QuizDto | null> {
    const doc = await QuizModel.findOne({ lessonId });
    if (!doc) return null;
    return this.toDto(doc);
  }

  async update(quizId: string, params: UpdateQuizParams): Promise<QuizDto | null> {
    const doc = await QuizModel.findOneAndUpdate(
      { id: quizId },
      { $set: params },
      { new: true, runValidators: true },
    );
    if (!doc) return null;
    return this.toDto(doc);
  }

  async delete(quizId: string): Promise<boolean> {
    const result = await QuizModel.deleteOne({ id: quizId });
    return result.deletedCount > 0;
  }
}
