import { apiClient } from "./apiClient";

export interface WishlistItem {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  category: string;
  price: number;
  thumbnail: string;
  createdAt: string;
}

const wishlistService = {
  /**
   * Get all wishlist items for the authenticated user
   */
  getWishlist: async (): Promise<WishlistItem[]> => {
    const res = await apiClient.get("/api/wishlist");
    return res.data.data as WishlistItem[];
  },

  /**
   * Add a course to wishlist
   */
  addToWishlist: async (courseId: string): Promise<WishlistItem> => {
    const res = await apiClient.post("/api/wishlist", { courseId });
    return res.data.data as WishlistItem;
  },

  /**
   * Remove a course from wishlist
   */
  removeFromWishlist: async (courseId: string): Promise<void> => {
    await apiClient.delete(`/api/wishlist/${courseId}`);
  },
};

export default wishlistService;
