import { WishlistRepository } from "../repository/WishlistRepository";
import { AddToWishlistUseCase } from "../useCase/AddToWishlistUseCase";
import { RemoveFromWishlistUseCase } from "../useCase/RemoveFromWishlistUseCase";
import { GetWishlistUseCase } from "../useCase/GetWishlistUseCase";
import { WishlistController } from "../controller/WishlistController";

const wishlistRepository = new WishlistRepository();

const addToWishlistUseCase = new AddToWishlistUseCase(wishlistRepository);
const removeFromWishlistUseCase = new RemoveFromWishlistUseCase(wishlistRepository);
const getWishlistUseCase = new GetWishlistUseCase(wishlistRepository);

export const wishlistController = new WishlistController(
  addToWishlistUseCase,
  removeFromWishlistUseCase,
  getWishlistUseCase,
);
