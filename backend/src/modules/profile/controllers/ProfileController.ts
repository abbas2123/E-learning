import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../../middlewares/authMiddleware";
import { UpdateProfileUseCase } from "../useCase/UpdateProfileUseCase";
import { CloudinaryService } from "../../../cloudinary/CloudinaryService";
import { ChangePasswordUseCase } from "../useCase/ChangePasswordUseCase";

export class ProfileController {
  constructor(
    private readonly updateProfileUseCase: UpdateProfileUseCase,
    private readonly cloudinaryService: CloudinaryService,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
  ) {}

  async updateProfile(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized.",
        });
      }
      let avatarUrl: string | undefined;
      if (req.file) {
        avatarUrl = await this.cloudinaryService.uploadImage(
          req.file.buffer,
          "profile-avatars",
        );
      }
      const result = await this.updateProfileUseCase.execute({
        userId: req.userId,
        name: req.body.name,
        location: req.body.location,
        phone: req.body.phone,
        avatarUrl,
      });
      return res.status(200).json({
        success: true,
        user: result,
      });
    } catch (error) {
      next(error);
    }
  }
  async changePassword(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const result = await this.changePasswordUseCase.execute({
        userId: req.userId!,
        ...req.body,
      });
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
