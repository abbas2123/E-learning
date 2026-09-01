import type { IUserRepository } from "../interface/IUserRepository";
import type { IJwtService } from "../interface/IJwtService";
import { UserBlockedError } from "../../../core/errors/AppError";

export class RefreshTokenUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly jwtService: IJwtService,
  ) {}

  async execute(refreshToken: string) {
    const decoded = this.jwtService.verifyRefreshToken(refreshToken);

    const user = await this.userRepository.findById(decoded.userId);

    if (!user) {
      throw new Error("User not found.");
    }

    if (user.getIsBlocked()) {
      throw new UserBlockedError();
    }

    if (!user.isEmailVerified()) {
      throw new Error("User account is not verified.");
    }

    const accessToken = this.jwtService.generateAccessToken(user.getId());

    return {
      accessToken,
    };
  }
}
