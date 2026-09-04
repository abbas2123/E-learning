import type { IWishlistRepository, WishlistItemDto } from "../interface/IWishlistRepository";
import { UserModel } from "../../auth/Repository/database/User";
import { UnauthorizedError } from "../../../core/errors/AppError";

export class GetWishlistUseCase {
  constructor(private readonly wishlistRepository: IWishlistRepository) {}

  async execute(userId: string): Promise<WishlistItemDto[]> {
    if (!userId) throw new UnauthorizedError();

    const user = await UserModel.findOne({
      $or: [{ id: userId }, { email: userId }],
    });
    const studentId = user?.id || userId;

    return this.wishlistRepository.getUserWishlist(studentId);
  }
}
