import type { IWishlistRepository } from "../interface/IWishlistRepository";
import { UserModel } from "../../auth/Repository/database/User";

export class RemoveFromWishlistUseCase {
  constructor(private readonly wishlistRepository: IWishlistRepository) {}

  async execute(userId: string, courseId: string): Promise<void> {
    if (!userId) throw new Error("Authenticated user required.");
    if (!courseId) throw new Error("Course ID required.");

    const user = await UserModel.findOne({
      $or: [{ id: userId }, { email: userId }],
    });
    const studentId = user?.id || userId;

    await this.wishlistRepository.removeFromWishlist(studentId, courseId);
  }
}
