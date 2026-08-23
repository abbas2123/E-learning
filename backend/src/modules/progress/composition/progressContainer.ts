import { LessonProgressRepository } from "../repository/LessonProgressRepository";
import { MarkLessonCompleteUseCase } from "../useCase/MarkLessonCompleteUseCase";
import { UpdateLessonWatchProgressUseCase } from "../useCase/UpdateLessonWatchProgressUseCase";
import { GetLessonProgressUseCase } from "../useCase/GetLessonProgressUseCase";
import { GetCourseProgressUseCase } from "../useCase/GetCourseProgressUseCase";
import { ProgressController } from "../controller/ProgressController";

export function createProgressContainer() {
  const progressRepository = new LessonProgressRepository();

  const markLessonCompleteUseCase = new MarkLessonCompleteUseCase(
    progressRepository,
  );
  const updateLessonWatchProgressUseCase =
    new UpdateLessonWatchProgressUseCase(progressRepository);
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
