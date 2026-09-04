import type { IWishlistRepository } from "../interface/IWishlistRepository";
import { UserModel } from "../../auth/Repository/database/User";
import { UnauthorizedError, ValidationError } from "../../../core/errors/AppError";

export class RemoveFromWishlistUseCase {
  constructor(private readonly wishlistRepository: IWishlistRepository) {}

  async execute(userId: string, courseId: string): Promise<void> {
    if (!userId) throw new UnauthorizedError();
    if (!courseId) throw new ValidationError("Course ID required.");

    const user = await UserModel.findOne({
      $or: [{ id: userId }, { email: userId }],
    });
    const studentId = user?.id || userId;

    await this.wishlistRepository.removeFromWishlist(studentId, courseId);
  }
}
