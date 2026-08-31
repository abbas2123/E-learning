import { SectionRepository } from "../repository/SectionRepository";
import { LessonRepository } from "../repository/LessonRepository";
import { CreateSectionUseCase } from "../useCase/CreateSectionUseCase";
import { UpdateSectionUseCase } from "../useCase/UpdateSectionUseCase";
import { DeleteSectionUseCase } from "../useCase/DeleteSectionUseCase";
import { CreateLessonUseCase } from "../useCase/CreateLessonUseCase";
import { UpdateLessonUseCase } from "../useCase/UpdateLessonUseCase";
import { DeleteLessonUseCase } from "../useCase/DeleteLessonUseCase";
import { GetCourseCurriculumUseCase } from "../useCase/GetCourseCurriculumUseCase";
import { ReorderSectionsUseCase } from "../useCase/ReorderSectionsUseCase";
import { ReorderLessonsUseCase } from "../useCase/ReorderLessonsUseCase";
import { CurriculumController } from "../controller/CurriculumController";

// Cross-module repository dependencies — injected, not imported as models
import { CourseRepository } from "../../course/repository/repository/CourseRepository";
import { EnrollmentRepository } from "../../admin/Repository/repository/EnrollmentRepository";
import { QuizRepository } from "../../quiz/repository/QuizRepository";
import { QuestionRepository } from "../../quiz/repository/QuestionRepository";

export function createCurriculumContainer() {
  const sectionRepository = new SectionRepository();
  const lessonRepository = new LessonRepository();
  const courseRepository = new CourseRepository();
  const enrollmentRepository = new EnrollmentRepository();
  const quizRepository = new QuizRepository();
  const questionRepository = new QuestionRepository();

  const createSectionUseCase = new CreateSectionUseCase(sectionRepository);
  const updateSectionUseCase = new UpdateSectionUseCase(sectionRepository);
  const deleteSectionUseCase = new DeleteSectionUseCase(sectionRepository, lessonRepository);
  const createLessonUseCase = new CreateLessonUseCase(sectionRepository, lessonRepository);
  const updateLessonUseCase = new UpdateLessonUseCase(lessonRepository);
  const deleteLessonUseCase = new DeleteLessonUseCase(lessonRepository);
  const getCourseCurriculumUseCase = new GetCourseCurriculumUseCase(
    sectionRepository,
    lessonRepository,
    courseRepository,
    enrollmentRepository,
    quizRepository,
    questionRepository,
  );
  const reorderSectionsUseCase = new ReorderSectionsUseCase(sectionRepository);
  const reorderLessonsUseCase = new ReorderLessonsUseCase(sectionRepository, lessonRepository);

  const controller = new CurriculumController(
    createSectionUseCase,
    updateSectionUseCase,
    deleteSectionUseCase,
    createLessonUseCase,
    updateLessonUseCase,
    deleteLessonUseCase,
    getCourseCurriculumUseCase,
    reorderSectionsUseCase,
    reorderLessonsUseCase,
  );

  return { controller };
}
