import type { IWishlistRepository, WishlistItemDto } from "../interface/IWishlistRepository";
import { CourseModel } from "../../course/repository/database/Course";
import { UserModel } from "../../auth/Repository/database/User";

export class AddToWishlistUseCase {
  constructor(private readonly wishlistRepository: IWishlistRepository) {}

  async execute(userId: string, courseId: string): Promise<WishlistItemDto> {
    if (!userId) throw new Error("Authenticated user required.");
    if (!courseId) throw new Error("Course ID required.");

    const user = await UserModel.findOne({
      $or: [{ id: userId }, { email: userId }],
    });
    if (!user) throw new Error("User not found.");

    const course = await CourseModel.findOne({ id: courseId });
    if (!course) throw new Error("Course not found.");

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
