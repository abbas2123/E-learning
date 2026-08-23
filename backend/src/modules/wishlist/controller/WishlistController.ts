import type { Request, Response, NextFunction } from "express";
import type { AddToWishlistUseCase } from "../useCase/AddToWishlistUseCase";
import type { RemoveFromWishlistUseCase } from "../useCase/RemoveFromWishlistUseCase";
import type { GetWishlistUseCase } from "../useCase/GetWishlistUseCase";

export class WishlistController {
  constructor(
    private readonly addToWishlistUseCase: AddToWishlistUseCase,
    private readonly removeFromWishlistUseCase: RemoveFromWishlistUseCase,
    private readonly getWishlistUseCase: GetWishlistUseCase,
  ) {}

  async addToWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const { courseId } = req.body;

      const item = await this.addToWishlistUseCase.execute(userId, courseId);
      return res.status(201).json({ success: true, data: item });
    } catch (error: any) {
      next(error);
    }
  }

  async removeFromWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const courseId = String(req.params.courseId);

      await this.removeFromWishlistUseCase.execute(userId, courseId);
      return res.status(200).json({ success: true, message: "Removed from wishlist." });
    } catch (error: any) {
      next(error);
    }
  }

  async getWishlist(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).userId;
      const items = await this.getWishlistUseCase.execute(userId);
      return res.status(200).json({ success: true, data: items });
    } catch (error: any) {
      next(error);
    }
  }
}
