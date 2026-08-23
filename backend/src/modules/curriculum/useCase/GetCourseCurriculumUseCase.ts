import type { ISectionRepository, SectionDto } from "../interface/ISectionRepository";
import type { ILessonRepository } from "../interface/ILessonRepository";
import { CourseModel } from "../../course/repository/database/Course";

export interface CourseCurriculumResult {
  courseId: string;
  sections: SectionDto[];
}

export class GetCourseCurriculumUseCase {
  constructor(
    private readonly sectionRepository: ISectionRepository,
    private readonly lessonRepository: ILessonRepository,
  ) {}

  async execute(courseId: string): Promise<CourseCurriculumResult> {
    if (!courseId) throw new Error("Course ID is required.");

    const course = await CourseModel.findOne({ id: courseId });
    if (!course) throw new Error("Course not found.");

    const sections = await this.sectionRepository.findByCourseId(courseId);
    const allLessons = await this.lessonRepository.findByCourseId(courseId);

    // Group lessons by sectionId
    const lessonsBySection = new Map<string, typeof allLessons>();
    for (const lesson of allLessons) {
      const list = lessonsBySection.get(lesson.sectionId) || [];
      list.push(lesson);
      lessonsBySection.set(lesson.sectionId, list);
    }

    const populatedSections: SectionDto[] = sections.map((section) => {
      const sectionLessons = lessonsBySection.get(section.id) || [];
      // Ensure lessons are sorted by order ASC
      sectionLessons.sort((a, b) => a.order - b.order);
      return {
        ...section,
        lessons: sectionLessons,
      };
    });

    return {
      courseId,
      sections: populatedSections,
    };
  }
}
