import { DashboardRepository } from "../Repository/repository/DashboardRepository";
import { GetDashboardSummaryUseCase } from "../useCase/getDashboardSummaryUseCase";
import { GetUserActiveCoursesUseCase } from "../useCase/getUserActiveCoursesUseCase";
import { GetCoursesCatalogUseCase } from "../useCase/getCoursesCatalogUseCase";
import { DashboardController } from "../constrollers/DashboardController";

const dashboardRepository = new DashboardRepository();

const getDashboardSummaryUseCase = new GetDashboardSummaryUseCase(
  dashboardRepository,
);
const getUserActiveCoursesUseCase = new GetUserActiveCoursesUseCase(
  dashboardRepository,
);
const getCoursesCatalogUseCase = new GetCoursesCatalogUseCase(
  dashboardRepository,
);

export const dashboardController = new DashboardController(
  getDashboardSummaryUseCase,
  getUserActiveCoursesUseCase,
  getCoursesCatalogUseCase,
);
