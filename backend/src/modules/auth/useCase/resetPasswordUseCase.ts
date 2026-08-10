import crypto from "crypto";
import { IUserRepository } from "../interface/IUserRepository";
import { IPasswordService } from "../interface/IPasswordService";
import { ResetPasswordDto } from "../dtos/ResetPasswordDto";

export class ResetPasswordUseCase {
  constructor(
    private userRepo: IUserRepository,
    private passwordService: IPasswordService,
  ) {}
  async execute(dto: ResetPasswordDto): Promise<void> {
    const { password, resetToken } = dto;

    const hashedToken = crypto

      .createHash("sha256")

      .update(resetToken)

      .digest("hex");

    const user = await this.userRepo.findByPasswordResetToken(hashedToken);
    if (!user) {
      throw new Error("Invalid or expired password reset token.");
    }
    const hashedPassword = await this.passwordService.hash(password);
    user.changePassword(hashedPassword);
    await this.userRepo.update(user);
    await this.userRepo.clearPasswordResetToken(user.getId());
  }
}
