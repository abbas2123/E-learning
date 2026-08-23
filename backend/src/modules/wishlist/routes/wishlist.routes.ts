import { Router } from "express";
import { wishlistController } from "../composition/wishlist.container";
import { authMiddleware } from "../../../middlewares/authMiddleware";

const router = Router();

// All wishlist endpoints require authentication
router.use(authMiddleware);

router.get("/", wishlistController.getWishlist.bind(wishlistController));

router.post("/", wishlistController.addToWishlist.bind(wishlistController));

router.delete(
  "/:courseId",
  wishlistController.removeFromWishlist.bind(wishlistController),
);

export default router;
