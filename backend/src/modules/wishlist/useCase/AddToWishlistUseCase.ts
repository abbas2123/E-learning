import type { IWishlistRepository, WishlistItemDto } from "../interface/IWishlistRepository";
import { CourseModel } from "../../course/repository/database/Course";
import { UserModel } from "../../auth/Repository/database/User";
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../../core/errors/AppError";

export class AddToWishlistUseCase {
  constructor(private readonly wishlistRepository: IWishlistRepository) {}

  async execute(userId: string, courseId: string): Promise<WishlistItemDto> {
    if (!userId) throw new UnauthorizedError();
    if (!courseId) throw new ValidationError("Course ID required.");

    const user = await UserModel.findOne({
      $or: [{ id: userId }, { email: userId }],
    });
    if (!user) throw new NotFoundError("User not found.", "USER_NOT_FOUND");

    const course = await CourseModel.findOne({ id: courseId });
    if (!course) throw new NotFoundError("Course not found.", "COURSE_NOT_FOUND");

    const studentId = user.id || userId;
    return this.wishlistRepository.addToWishlist({
      userId: studentId,
      courseId: course.id || courseId,
      courseTitle: course.title,
      category: course.category || "Development",
      price: course.price || 0,
      thumbnail: course.thumbnail || "",
    });
  }
}
