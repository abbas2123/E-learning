import type { IUserRepository } from "../../auth/interface/IUserRepository";
import type { UpdateProfileDto } from "../dtos/UpdateProfileDto";
import { NotFoundError } from "../../../core/errors/AppError";

type updateProfileInput = UpdateProfileDto & {
  userId: string;
  avatarUrl?: string;
};

export class UpdateProfileUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: updateProfileInput) {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new NotFoundError("User not found", "USER_NOT_FOUND");
    }

    user.updateProfile(
      input.name,
      input.phone,
      input.location,
      input.avatarUrl,
    );

    const updatedUser = await this.userRepository.update(user);
    return updatedUser.toJSON();
  }
}
