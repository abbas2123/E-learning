import type { ISectionRepository, LessonDto } from "../interface/ISectionRepository";
import type { ILessonRepository } from "../interface/ILessonRepository";
import { CourseModel } from "../../course/repository/database/Course";

export interface CreateLessonInput {
  sectionId: string;
  title: string;
  description?: string;
  type?: "video" | "text" | "quiz" | "assignment";
  videoUrl?: string;
  duration?: number;
  order?: number;
  isPreview?: boolean;
  userId: string;
  userRole?: string;
}

export class CreateLessonUseCase {
  constructor(
    private readonly sectionRepository: ISectionRepository,
    private readonly lessonRepository: ILessonRepository,
  ) {}

  async execute(input: CreateLessonInput): Promise<LessonDto> {
    const {
      sectionId,
      title,
      description,
      type,
      videoUrl,
      duration,
      order,
      isPreview,
      userId,
      userRole,
    } = input;

    if (!sectionId) throw new Error("Section ID is required.");
    if (!title || !title.trim()) throw new Error("Lesson title is required.");

    const section = await this.sectionRepository.findById(sectionId);
    if (!section) throw new Error("Parent section not found.");

    if (userRole !== "admin") {
      const course = await CourseModel.findOne({ id: section.courseId });
      if (!course || course.createdBy !== userId) {
        throw new Error("Unauthorized to add lessons to this section.");
      }
    }

    return this.lessonRepository.createLesson({
      sectionId,
      courseId: section.courseId,
      title: title.trim(),
      description,
      type: type || "video",
      videoUrl,
      duration: duration || 0,
      order,
      isPreview: Boolean(isPreview),
    });
  }
}
