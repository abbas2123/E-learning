import { randomUUID } from "crypto";
import { QuestionModel } from "../database/Question";
import type {
  IQuestionRepository,
  QuestionDto,
  QuestionWithAnswersDto,
  CreateQuestionParams,
  UpdateQuestionParams,
} from "../interface/IQuestionRepository";

export class QuestionRepository implements IQuestionRepository {
  private toDto(doc: any): QuestionDto {
    return {
      id: doc.id,
      quizId: doc.quizId,
      courseId: doc.courseId,
      questionText: doc.questionText,
      questionType: doc.questionType,
      options: doc.options ?? [],
      points: doc.points ?? 1,
      order: doc.order ?? 1,
      explanation: doc.explanation ?? null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  private toDtoWithAnswers(doc: any): QuestionWithAnswersDto {
    return {
      ...this.toDto(doc),
      correctOptionIds: doc.correctOptionIds ?? [],
    };
  }

  async create(params: CreateQuestionParams): Promise<QuestionDto> {
    const doc = await QuestionModel.create({
      id: randomUUID(),
      ...params,
    });
    return this.toDto(doc);
  }

  async findById(questionId: string): Promise<QuestionDto | null> {
    // selecte: false on correctOptionIds — not included by default
    const doc = await QuestionModel.findOne({ id: questionId });
    if (!doc) return null;
    return this.toDto(doc);
  }

  async findByIdWithAnswers(questionId: string): Promise<QuestionWithAnswersDto | null> {
    // Explicitly select correctOptionIds for internal grading use
    const doc = await QuestionModel.findOne({ id: questionId }).select("+correctOptionIds");
    if (!doc) return null;
    return this.toDtoWithAnswers(doc);
  }

  async findByQuizId(quizId: string): Promise<QuestionDto[]> {
    const docs = await QuestionModel.find({ quizId }).sort({ order: 1 });
    return docs.map((d) => this.toDto(d));
  }

  async findByQuizIdWithAnswers(quizId: string): Promise<QuestionWithAnswersDto[]> {
    const docs = await QuestionModel.find({ quizId })
      .select("+correctOptionIds")
      .sort({ order: 1 });
    return docs.map((d) => this.toDtoWithAnswers(d));
  }

  async update(questionId: string, params: UpdateQuestionParams): Promise<QuestionDto | null> {
    const doc = await QuestionModel.findOneAndUpdate(
      { id: questionId },
      { $set: params },
      { new: true, runValidators: true },
    );
    if (!doc) return null;
    return this.toDto(doc);
  }

  async delete(questionId: string): Promise<boolean> {
    const result = await QuestionModel.deleteOne({ id: questionId });
    return result.deletedCount > 0;
  }

  async deleteByQuizId(quizId: string): Promise<number> {
    const result = await QuestionModel.deleteMany({ quizId });
    return result.deletedCount;
  }

  async reorderQuestions(quizId: string, orderedQuestionIds: string[]): Promise<QuestionDto[]> {
    const updates = orderedQuestionIds.map((id, index) =>
      QuestionModel.findOneAndUpdate(
        { id, quizId },
        { $set: { order: index + 1 } },
        { new: true },
      ),
    );
    const results = await Promise.all(updates);
    return results.filter(Boolean).map((d) => this.toDto(d));
  }

  async getMaxOrder(quizId: string): Promise<number> {
    const doc = await QuestionModel.findOne({ quizId }).sort({ order: -1 }).select("order");
    return doc?.order ?? 0;
  }
}
