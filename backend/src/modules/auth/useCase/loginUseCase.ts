import { LoginUserDTO } from "../dtos/LoginUserDto";
import { IPasswordService } from "../interface/IPasswordService";
import { IUserRepository } from "../interface/IUserRepository";
import { IJwtService } from "../interface/IJwtService";
import { IOtpRepository } from "../interface/IOtpRepository";
import { IOtpService } from "../interface/IOtpService";
import {
  AccountNotVerifiedError,
  InvalidCredentialsError,
  UserBlockedError,
} from "../../../core/errors/AppError";

export class LoginUseCase {
  constructor(
    private passwordService: IPasswordService,
    private userRepository: IUserRepository,
    private jwtService: IJwtService,
    private otpRepository: IOtpRepository,
    private otpService: IOtpService,
  ) {}

  async execute(dto: LoginUserDTO) {
    const { email, password } = dto;

    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    if (user.getIsBlocked()) {
      throw new UserBlockedError();
    }

    if (user.getRole() === "admin") {
      throw new Error("Admin accounts must use the Admin Portal to sign in.");
    }

    const hashedPassword = await user.getPassword();
    if (!hashedPassword) {
      throw new InvalidCredentialsError();
    }

    const isMatch = await this.passwordService.compare(
      password,
      hashedPassword,
    );

    if (!isMatch) {
      throw new InvalidCredentialsError();
    }

    // Enforce OTP verification: check if user isVerified is true
    if (!user.isEmailVerified()) {
      const otp = this.otpService.generateOtp();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      const hashedOtp = await this.passwordService.hash(otp);

      await this.otpRepository.saveOtp(email, hashedOtp, expiresAt);
      await this.otpService.sendOtp(email, otp);

      throw new AccountNotVerifiedError(email);
    }

    const accessToken = this.jwtService.generateAccessToken(user.getId());
    const refreshToken = this.jwtService.generateRefreshToken(user.getId());

    return {
      user: {
        id: user.getId(),
        name: user.getName(),
        email: user.getEmail(),
        role: user.getRole(),
        isVerified: user.isEmailVerified(),
        avatar: user.getAvatar(),
      },
      accessToken,
      refreshToken,
    };
  }
}
