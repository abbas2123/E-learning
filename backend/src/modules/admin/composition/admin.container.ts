import { AdminRepository } from "../Repository/repository/AdminRepository";

import { GetAdminStatsUseCase } from "../useCase/GetAdminStatsUseCase";
import { GetUsersUseCase } from "../useCase/GetUsersUseCase";
import { ToggleUserBlockUseCase } from "../useCase/ToggleUserBlockUseCase";
import { CreateUserUseCase } from "../useCase/CreateUserUseCase";
import { GetCoursesUseCase } from "../useCase/GetCoursesUseCase";
import { GetPendingCoursesUseCase } from "../useCase/GetPendingCoursesUseCase";
import { CreateCourseUseCase } from "../useCase/CreateCourseUseCase";
import { ApproveCourseUseCase } from "../useCase/ApproveCourseUseCase";
import { RejectCourseUseCase } from "../useCase/RejectCourseUseCase";
import { DeleteCourseUseCase } from "../useCase/DeleteCourseUseCase";
import { GetCategoriesUseCase } from "../useCase/GetCategoriesUseCase";
import { CreateCategoryUseCase } from "../useCase/CreateCategoryUseCase";
import { DeleteCategoryUseCase } from "../useCase/DeleteCategoryUseCase";
import { GetEnrollmentsUseCase } from "../useCase/GetEnrollmentsUseCase";
import { GetNotificationsUseCase } from "../useCase/GetNotificationsUseCase";
import { MarkNotificationsReadUseCase } from "../useCase/MarkNotificationsReadUseCase";

import { AdminController } from "../controllers/AdminController";

// ─── Repository ──────────────────────────────────────────────────────────────
const adminRepository = new AdminRepository();

// ─── Use Cases ───────────────────────────────────────────────────────────────
const getAdminStatsUseCase = new GetAdminStatsUseCase(adminRepository);
const getUsersUseCase = new GetUsersUseCase(adminRepository);
const toggleUserBlockUseCase = new ToggleUserBlockUseCase(adminRepository);
const createUserUseCase = new CreateUserUseCase(adminRepository);
const getCoursesUseCase = new GetCoursesUseCase(adminRepository);
const getPendingCoursesUseCase = new GetPendingCoursesUseCase(adminRepository);
const createCourseUseCase = new CreateCourseUseCase(adminRepository);
const approveCourseUseCase = new ApproveCourseUseCase(adminRepository);
const rejectCourseUseCase = new RejectCourseUseCase(adminRepository);
const deleteCourseUseCase = new DeleteCourseUseCase(adminRepository);
const getCategoriesUseCase = new GetCategoriesUseCase(adminRepository);
const createCategoryUseCase = new CreateCategoryUseCase(adminRepository);
const deleteCategoryUseCase = new DeleteCategoryUseCase(adminRepository);
const getEnrollmentsUseCase = new GetEnrollmentsUseCase(adminRepository);
const getNotificationsUseCase = new GetNotificationsUseCase(adminRepository);
const markNotificationsReadUseCase = new MarkNotificationsReadUseCase(adminRepository);

// ─── Controller ──────────────────────────────────────────────────────────────
export const adminController = new AdminController(
  getAdminStatsUseCase,
  getUsersUseCase,
  toggleUserBlockUseCase,
  createUserUseCase,
  getCoursesUseCase,
  getPendingCoursesUseCase,
  createCourseUseCase,
  approveCourseUseCase,
  rejectCourseUseCase,
  deleteCourseUseCase,
  getCategoriesUseCase,
  createCategoryUseCase,
  deleteCategoryUseCase,
  getEnrollmentsUseCase,
  getNotificationsUseCase,
  markNotificationsReadUseCase,
);
