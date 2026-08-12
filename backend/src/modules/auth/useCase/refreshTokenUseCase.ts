import type { IUserRepository } from "../interface/IUserRepository";
import type { IJwtService } from "../interface/IJwtService";

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
      throw new Error("User account is blocked.");
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
