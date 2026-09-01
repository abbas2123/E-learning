import type { IUserRepository } from "../../auth/interface/IUserRepository";
import type { UpdateProfileDto } from "../dtos/UpdateProfileDto";

type updateProfileInput = UpdateProfileDto & {
  userId: string;
  avatarUrl?: string;
};

export class UpdateProfileUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: updateProfileInput) {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new Error("User not found");
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
