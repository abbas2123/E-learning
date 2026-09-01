import type { IUserRepository } from "../interface/IUserRepository";
import type { IPasswordService } from "../interface/IPasswordService";
import type { IJwtService } from "../interface/IJwtService";
import { UserRole } from "../Repository/database/User";
import { UserBlockedError } from "../../../core/errors/AppError";
import { InvalidCredentialsError } from "../../../core/errors/AppError";

interface AdminLoginInput {
  email: string;
  password: string;
}

export class AdminLoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService,
    private readonly jwtService: IJwtService,
  ) {}

  async execute(input: AdminLoginInput) {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new InvalidCredentialsError();
    }
    if (user.getProvider() !== "local") {
      throw new Error("Admin account must use email and password.");
    }
    if (user.getRole() !== UserRole.ADMIN) {
      throw new Error("Admin access required.");
    }

    if (user.getIsBlocked()) {
      throw new UserBlockedError();
    }

    if (!user.isEmailVerified()) {
      const error = new Error(
        "Account not verified. Please verify your email.",
      );

      // So your controller can return requireOtp
      (error as any).requireOtp = true;
      (error as any).email = user.getEmail();

      throw error;
    }

    const password = user.getPassword();

    if (!password) {
      throw new Error("This account does not have a password.");
    }

    const isPasswordValid = await this.passwordService.compare(
      input.password,

      password,
    );

    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    const accessToken = this.jwtService.generateAccessToken(user.getId());

    const refreshToken = this.jwtService.generateRefreshToken(user.getId());

    return {
      user,
      accessToken,
      refreshToken,
    };
  }
}
