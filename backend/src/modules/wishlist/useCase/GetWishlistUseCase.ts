import type { IWishlistRepository, WishlistItemDto } from "../interface/IWishlistRepository";
import { UserModel } from "../../auth/Repository/database/User";

export class GetWishlistUseCase {
  constructor(private readonly wishlistRepository: IWishlistRepository) {}

  async execute(userId: string): Promise<WishlistItemDto[]> {
    if (!userId) throw new Error("Authenticated user required.");

    const user = await UserModel.findOne({
      $or: [{ id: userId }, { email: userId }],
    });
    const studentId = user?.id || userId;

    return this.wishlistRepository.getUserWishlist(studentId);
  }
}
