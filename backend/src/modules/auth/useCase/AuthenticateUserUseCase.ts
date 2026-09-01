import {
  UserBlockedError,
  UnauthorizedError,
} from "../../../core/errors/AppError";
import type { IUserRepository } from "../interface/IUserRepository";
import type { IJwtService } from "../interface/IJwtService";

export type AuthenticatedUser = {
  userId: string;
  userRole: string;
  email: string;
};

export class AuthenticateUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: IJwtService,
  ) {}

  async execute(token: string): Promise<AuthenticatedUser> {
    let decoded: { userId: string };
    try {
      decoded = this.jwtService.verifyAccessToken(token);
    } catch {
      throw new UnauthorizedError("Invalid or expired access token.");
    }

    if (!decoded?.userId) {
      throw new UnauthorizedError("Invalid or expired access token.");
    }

    const user = await this.userRepository.findById(decoded.userId);
    if (!user) {
      throw new UnauthorizedError("User account not found.");
    }

    if (user.getIsBlocked()) {
      throw new UserBlockedError();
    }

    if (!user.isEmailVerified()) {
      throw new UnauthorizedError(
        "Account not verified. Please verify your email via OTP.",
      );
    }

    return {
      userId: user.getId(),
      userRole: user.getRole(),
      email: user.getEmail(),
    };
  }
}
