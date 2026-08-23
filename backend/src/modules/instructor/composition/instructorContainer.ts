import { InstructorRepository } from "../repository/InstructorRepository";
import { GetInstructorDashboardUseCase } from "../useCase/GetInstructorDashboardUseCase";
import { GetInstructorCoursesUseCase } from "../useCase/GetInstructorCoursesUseCase";
import { GetInstructorCourseUseCase } from "../useCase/GetInstructorCourseUseCase";
import { CreateInstructorCourseUseCase } from "../useCase/CreateInstructorCourseUseCase";
import { UpdateInstructorCourseUseCase } from "../useCase/UpdateInstructorCourseUseCase";
import { SubmitCourseForApprovalUseCase } from "../useCase/SubmitCourseForApprovalUseCase";
import { GetInstructorStudentsUseCase } from "../useCase/GetInstructorStudentsUseCase";
import { GetInstructorRevenueUseCase } from "../useCase/GetInstructorRevenueUseCase";
import { GetInstructorAnalyticsUseCase } from "../useCase/GetInstructorAnalyticsUseCase";
import { InstructorController } from "../controller/InstructorController";

export function createInstructorContainer() {
  const repository = new InstructorRepository();

  const getInstructorDashboardUseCase = new GetInstructorDashboardUseCase(repository);
  const getInstructorCoursesUseCase = new GetInstructorCoursesUseCase(repository);
  const getInstructorCourseUseCase = new GetInstructorCourseUseCase(repository);
  const createInstructorCourseUseCase = new CreateInstructorCourseUseCase(repository);
  const updateInstructorCourseUseCase = new UpdateInstructorCourseUseCase(repository);
  const submitCourseForApprovalUseCase = new SubmitCourseForApprovalUseCase(repository);
  const getInstructorStudentsUseCase = new GetInstructorStudentsUseCase(repository);
  const getInstructorRevenueUseCase = new GetInstructorRevenueUseCase(repository);
  const getInstructorAnalyticsUseCase = new GetInstructorAnalyticsUseCase(repository);

  const controller = new InstructorController(
    getInstructorDashboardUseCase,
    getInstructorCoursesUseCase,
    getInstructorCourseUseCase,
    createInstructorCourseUseCase,
    updateInstructorCourseUseCase,
    submitCourseForApprovalUseCase,
    getInstructorStudentsUseCase,
    getInstructorRevenueUseCase,
    getInstructorAnalyticsUseCase,
  );

  return { controller };
}
