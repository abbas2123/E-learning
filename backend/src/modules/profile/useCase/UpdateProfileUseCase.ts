import type { IUserRepository } from "../../auth/interface/IUserRepository";
import type { UpdateProfileDto } from "../dtos/UpdateProfileDto";

type updateProfileInput = UpdateProfileDto & {
  userId: string;
  avatarUrl?: string;
};

export class UpdateProfileUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: updateProfileInput) {
    console.log("USE CASE INPUT:", input);
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw new Error("User not found");
    }
    console.log("BEFORE UPDATE:", {
      phone: user.getPhone(),

      location: user.getLocation(),
    });
    user.updateProfile(
      input.name,
      input.phone,
      input.location,
      input.avatarUrl,
    );
    console.log("AFTER ENTITY UPDATE:", {
      phone: user.getPhone(),

      location: user.getLocation(),
    });
    const updatedUser = await this.userRepository.update(user);
    console.log("AFTER REPOSITORY UPDATE:", {
      phone: updatedUser.getPhone(),

      location: updatedUser.getLocation(),
    });
    return updatedUser.toJSON();
  }
}
