import { randomUUID } from "crypto";
import { LessonProgressModel } from "../database/LessonProgress";
import type {
  ILessonProgressRepository,
  LessonProgressDto,
  UpsertProgressParams,
} from "../interface/ILessonProgressRepository";

export class LessonProgressRepository implements ILessonProgressRepository {
  private toDto(doc: any): LessonProgressDto {
    return {
      id: doc.id ?? doc._id.toString(),
      studentId: doc.studentId,
      courseId: doc.courseId,
      lessonId: doc.lessonId,
      completed: Boolean(doc.completed),
      watchedSeconds: doc.watchedSeconds ?? 0,
      completedAt: doc.completedAt ? new Date(doc.completedAt) : null,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async upsertProgress(params: UpsertProgressParams): Promise<LessonProgressDto> {
    const { studentId, courseId, lessonId, completed, watchedSeconds, completedAt } = params;

    const updateFields: Record<string, any> = {};

    if (completed !== undefined) {
      updateFields.completed = completed;
    }

    if (watchedSeconds !== undefined) {
      updateFields.watchedSeconds = watchedSeconds;
    }

    if (completedAt !== undefined) {
      updateFields.completedAt = completedAt;
    }

    const doc = await LessonProgressModel.findOneAndUpdate(
      { studentId, courseId, lessonId },
      {
        $set: updateFields,
        $setOnInsert: { id: randomUUID() },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
    );

    return this.toDto(doc);
  }

  async findByLesson(
    studentId: string,
    courseId: string,
    lessonId: string,
  ): Promise<LessonProgressDto | null> {
    const doc = await LessonProgressModel.findOne({ studentId, courseId, lessonId });
    if (!doc) return null;
    return this.toDto(doc);
  }

  async findByCourse(
    studentId: string,
    courseId: string,
  ): Promise<LessonProgressDto[]> {
    const docs = await LessonProgressModel.find({ studentId, courseId });
    return docs.map((d) => this.toDto(d));
  }

  async countCompletedLessons(studentId: string, courseId: string): Promise<number> {
    return LessonProgressModel.countDocuments({
      studentId,
      courseId,
      completed: true,
    });
  }
}
