import { LessonProgressRepository } from "../repository/LessonProgressRepository";
import { MarkLessonCompleteUseCase } from "../useCase/MarkLessonCompleteUseCase";
import { UpdateLessonWatchProgressUseCase } from "../useCase/UpdateLessonWatchProgressUseCase";
import { GetLessonProgressUseCase } from "../useCase/GetLessonProgressUseCase";
import { GetCourseProgressUseCase } from "../useCase/GetCourseProgressUseCase";
import { ProgressController } from "../controller/ProgressController";
import { CourseRepository } from "../../course/repository/repository/CourseRepository";
import { LessonRepository } from "../../curriculum/repository/LessonRepository";
import { EnrollmentRepository } from "../../admin/Repository/repository/EnrollmentRepository";

export function createProgressContainer() {
  const progressRepository = new LessonProgressRepository();
  const courseRepository = new CourseRepository();
  const lessonRepository = new LessonRepository();
  const enrollmentRepository = new EnrollmentRepository();

  const markLessonCompleteUseCase = new MarkLessonCompleteUseCase(
    progressRepository,
    courseRepository,
    lessonRepository,
    enrollmentRepository,
  );
  const updateLessonWatchProgressUseCase = new UpdateLessonWatchProgressUseCase(
    progressRepository,
    courseRepository,
    lessonRepository,
    enrollmentRepository,
  );
  const getLessonProgressUseCase = new GetLessonProgressUseCase(
    progressRepository,
  );
  const getCourseProgressUseCase = new GetCourseProgressUseCase(
    progressRepository,
  );

  const controller = new ProgressController(
    markLessonCompleteUseCase,
    updateLessonWatchProgressUseCase,
    getLessonProgressUseCase,
    getCourseProgressUseCase,
  );

  return { controller };
}
