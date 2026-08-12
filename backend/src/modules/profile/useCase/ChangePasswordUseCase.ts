import { IUserRepository } from "../../auth/interface/IUserRepository";
import { IPasswordService } from "../../auth/interface/IPasswordService";
import { ChnagepasswordDto } from "../dtos/ChangePasswordDto";

type changePasswordInput = ChnagepasswordDto & {
  userId: string;
};

export class ChangePasswordUseCase {
  constructor(
    private userRepository: IUserRepository,
    private passwordService: IPasswordService,
  ) {}

  async execute(input: changePasswordInput) {
    const { confirmPassword, currentPassword, newPassword, userId } = input;

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }
    if (user.getProvider() === "google") {
      throw new Error(
        "Google accounts cannoy change password beause they do not use local password.",
      );
    }

    if (!user.getPassword()) {
      throw new Error("This account does not have password");
    }

    if (newPassword !== confirmPassword) {
      throw new Error("New Password do not match");
    }

    const isCurrentPasswordValid = await this.passwordService.compare(
      currentPassword,
      user.getPassword()!,
    );

    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    const hashedPassword = await this.passwordService.hash(newPassword);
    user.changePassword(hashedPassword);
    await this.userRepository.update(user);

    return {
      success: true,
      message: "Password updated successfully",
    };
  }
}
