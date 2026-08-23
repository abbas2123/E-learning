import { CourseRepository } from "../repository/repository/CourseRepository";
import { GetCoursesUseCase } from "../useCase/GetCoursesUseCase";
import { GetCourseUseCase } from "../useCase/GetCourseUseCase";
import { CreateCourseUseCase } from "../useCase/CreateCourseUseCase";
import { CourseController } from "../controller/CourseController";

const courseRepository = new CourseRepository();

const getCoursesUseCase = new GetCoursesUseCase(courseRepository);
const getCourseUseCase = new GetCourseUseCase(courseRepository);
const createCourseUseCase = new CreateCourseUseCase(courseRepository);

export const courseController = new CourseController(
  getCoursesUseCase,
  getCourseUseCase,
  createCourseUseCase,
);
