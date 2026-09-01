import type { IUserRepository } from "../interface/IUserRepository";
import type { IJwtService } from "../interface/IJwtService";
import {
  AccountNotVerifiedError,
  InvalidRefreshTokenError,
  NotFoundError,
  UserBlockedError,
} from "../../../core/errors/AppError";

export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: IJwtService,
  ) {}

  async execute(refreshToken: string) {
    let decoded: { userId: string };
    try {
      decoded = this.jwtService.verifyRefreshToken(refreshToken);
    } catch {
      throw new InvalidRefreshTokenError();
    }

    const user = await this.userRepository.findById(decoded.userId);

    if (!user) {
      throw new NotFoundError("User not found.", "USER_NOT_FOUND");
    }

    if (user.getIsBlocked()) {
      throw new UserBlockedError();
    }

    if (!user.isEmailVerified()) {
      throw new AccountNotVerifiedError();
    }

    const accessToken = this.jwtService.generateAccessToken(user.getId());

    return {
      accessToken,
    };
  }
}
