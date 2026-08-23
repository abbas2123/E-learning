import type { IUserRepository } from "../interface/IUserRepository";
import type { IPasswordService } from "../interface/IPasswordService";
import type { IJwtService } from "../interface/IJwtService";
import { UserRole } from "../Repository/database/User";

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
      throw new Error("Invalid email or password.");
    }
    if (user.getProvider() !== "local") {
      throw new Error("Admin account must use email and password.");
    }
    if (user.getRole() !== UserRole.ADMIN) {
      throw new Error("Admin access required.");
    }

    if (user.getIsBlocked()) {
      throw new Error("Your account has been blocked.");
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
      throw new Error("Invalid email or password.");
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
