import { randomUUID } from "crypto";
import { WishlistModel } from "../database/Wishlist";
import type {
  IWishlistRepository,
  WishlistItemDto,
  AddWishlistParams,
} from "../interface/IWishlistRepository";

export class WishlistRepository implements IWishlistRepository {
  private toDto(doc: any): WishlistItemDto {
    return {
      id: doc.id ?? doc._id.toString(),
      userId: doc.userId,
      courseId: doc.courseId,
      courseTitle: doc.courseTitle,
      category: doc.category,
      price: doc.price,
      thumbnail: doc.thumbnail,
      createdAt: doc.createdAt,
    };
  }

  async addToWishlist(params: AddWishlistParams): Promise<WishlistItemDto> {
    const existing = await WishlistModel.findOne({
      userId: params.userId,
      courseId: params.courseId,
    });

    if (existing) {
      return this.toDto(existing);
    }

    const doc = new WishlistModel({
      id: randomUUID(),
      userId: params.userId,
      courseId: params.courseId,
      courseTitle: params.courseTitle,
      category: params.category,
      price: params.price,
      thumbnail: params.thumbnail,
    });

    const saved = await doc.save();
    return this.toDto(saved);
  }

  async removeFromWishlist(userId: string, courseId: string): Promise<void> {
    await WishlistModel.deleteOne({ userId, courseId });
  }

  async getUserWishlist(userId: string): Promise<WishlistItemDto[]> {
    const docs = await WishlistModel.find({ userId }).sort({ createdAt: -1 });
    return docs.map((d) => this.toDto(d));
  }

  async isInWishlist(userId: string, courseId: string): Promise<boolean> {
    const count = await WishlistModel.countDocuments({ userId, courseId });
    return count > 0;
  }
}
