export interface WishlistItemDto {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  category: string;
  price: number;
  thumbnail: string;
  createdAt: Date;
}

export interface AddWishlistParams {
  userId: string;
  courseId: string;
  courseTitle: string;
  category: string;
  price: number;
  thumbnail: string;
}

export interface IWishlistRepository {
  addToWishlist(params: AddWishlistParams): Promise<WishlistItemDto>;
  removeFromWishlist(userId: string, courseId: string): Promise<void>;
  getUserWishlist(userId: string): Promise<WishlistItemDto[]>;
  isInWishlist(userId: string, courseId: string): Promise<boolean>;
}
