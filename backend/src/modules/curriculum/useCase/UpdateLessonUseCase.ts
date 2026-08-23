import type { LessonDto, LessonResourceDto } from "../interface/ISectionRepository";
import type { ILessonRepository } from "../interface/ILessonRepository";
import { CourseModel } from "../../course/repository/database/Course";

export interface UpdateLessonInput {
  lessonId: string;
  title?: string;
  description?: string;
  type?: "video" | "text" | "quiz" | "assignment";
  videoUrl?: string;
  duration?: number;
  order?: number;
  isPreview?: boolean;
  resources?: LessonResourceDto[];
  userId: string;
  userRole?: string;
}

export class UpdateLessonUseCase {
  constructor(private readonly lessonRepository: ILessonRepository) {}

  async execute(input: UpdateLessonInput): Promise<LessonDto> {
    const {
      lessonId,
      title,
      description,
      type,
      videoUrl,
      duration,
      order,
      isPreview,
      resources,
      userId,
      userRole,
    } = input;

    if (!lessonId) throw new Error("Lesson ID is required.");

    const existingLesson = await this.lessonRepository.findById(lessonId);
    if (!existingLesson) throw new Error("Lesson not found.");

    if (userRole !== "admin") {
      const course = await CourseModel.findOne({ id: existingLesson.courseId });
      if (!course || course.createdBy !== userId) {
        throw new Error("Unauthorized to modify this lesson.");
      }
    }

    const updated = await this.lessonRepository.updateLesson(lessonId, {
      title,
      description,
      type,
      videoUrl,
      duration,
      order,
      isPreview,
      resources,
    });

    if (!updated) throw new Error("Failed to update lesson.");
    return updated;
  }
}
