import type { ISectionRepository, SectionDto, LessonDto } from "../interface/ISectionRepository";
import type { ILessonRepository } from "../interface/ILessonRepository";
import type { ICourseRepository } from "../../course/interface/ICourseRepository";
import type { IEnrollmentRepository } from "../../admin/interface/IEnrollmentRepository";
import type { IQuizRepository, QuizDto } from "../../quiz/interface/IQuizRepository";
import type { IQuestionRepository } from "../../quiz/interface/IQuestionRepository";

export interface CourseCurriculumResult {
  courseId: string;
  isEnrolled: boolean;
  sections: SectionDto[];
}

export class GetCourseCurriculumUseCase {
  constructor(
    private readonly sectionRepository: ISectionRepository,
    private readonly lessonRepository: ILessonRepository,
    private readonly courseRepository: ICourseRepository,
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly quizRepository: IQuizRepository,
    private readonly questionRepository: IQuestionRepository,
  ) {}

  async execute(courseId: string, userId?: string, userRole?: string): Promise<CourseCurriculumResult> {
    if (!courseId) throw new Error("Course ID is required.");

    // Validate via repository — no direct model access
    const course = await this.courseRepository.findSummaryById(courseId);
    if (!course) throw new Error("Course not found.");

    let isFullAccess = false;
    if (userRole === "admin" || (userId && course.createdBy === userId)) {
      isFullAccess = true;
    } else if (userId) {
      isFullAccess = await this.enrollmentRepository.isStudentEnrolled(userId, courseId);
    }

    const sections = await this.sectionRepository.findByCourseId(courseId);
    const allLessons = await this.lessonRepository.findByCourseId(courseId);

    // Fetch all quizzes via repository then batch-fetch question counts
    const courseQuizzes: QuizDto[] = await this.quizRepository.findByCourseId(courseId);
    const quizIds = courseQuizzes.map((q) => q.id);
    const questionCountByQuiz = await this.questionRepository.getQuestionCountsByQuizIds(quizIds);

    // Group lessons by sectionId and protect private video assets if not enrolled
    const lessonsBySection = new Map<string, LessonDto[]>();
    const representedQuizIds = new Set<string>();

    for (const lesson of allLessons) {
      let resolvedQuizId = lesson.quizId;
      let resolvedQuestionCount = 0;

      if (lesson.type === "quiz") {
        // Find matching quiz by quizId, lessonId, or title
        const matchingQuiz = courseQuizzes.find(
          (q) =>
            q.id === lesson.quizId ||
            q.lessonId === lesson.id ||
            q.id === lesson.id ||
            q.title.trim().toLowerCase() === lesson.title.trim().toLowerCase(),
        );

        if (matchingQuiz) {
          resolvedQuizId = matchingQuiz.id;
          resolvedQuestionCount = questionCountByQuiz.get(matchingQuiz.id) || 0;
          representedQuizIds.add(matchingQuiz.id);
        }
      }

      const sanitizedLesson: LessonDto = {
        ...lesson,
        quizId: resolvedQuizId,
        questionCount: resolvedQuestionCount,
        videoUrl: isFullAccess || lesson.isPreview ? lesson.videoUrl : undefined,
        resources: isFullAccess ? (lesson.resources || []) : [],
      };

      const list = lessonsBySection.get(lesson.sectionId) || [];
      list.push(sanitizedLesson);
      lessonsBySection.set(lesson.sectionId, list);
    }

    const populatedSections: SectionDto[] = sections.map((section) => {
      const sectionLessons = lessonsBySection.get(section.id) || [];
      sectionLessons.sort((a, b) => a.order - b.order);
      return {
        ...section,
        lessons: sectionLessons,
      };
    });

    // If there are standalone quizzes created that were not linked to a section lesson,
    // attach them into an Assessment section so they are never lost to learners/instructors
    const unlinkedQuizzes = courseQuizzes.filter((q) => !representedQuizIds.has(q.id));
    if (unlinkedQuizzes.length > 0) {
      const assessmentLessons: LessonDto[] = unlinkedQuizzes.map((q, idx) => ({
        id: q.id,
        sectionId: "sec-assessments",
        courseId,
        title: q.title,
        description: q.description || q.instructions || "Knowledge Assessment & Quiz",
        type: "quiz" as const,
        quizId: q.id,
        questionCount: questionCountByQuiz.get(q.id) || 0,
        duration: q.timeLimitSeconds ? Math.ceil(q.timeLimitSeconds / 60) : 15,
        order: idx + 1,
        isPreview: false,
        resources: [],
        createdAt: q.createdAt,
        updatedAt: q.updatedAt,
      }));

      populatedSections.push({
        id: "sec-assessments",
        courseId,
        title: "Course Assessments & Quizzes",
        order: 999,
        lessons: assessmentLessons,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return {
      courseId,
      isEnrolled: isFullAccess,
      sections: populatedSections,
    };
  }
}
