import { LoginUserDTO } from "../dtos/LoginUserDto";
import { IPasswordService } from "../interface/IPasswordService";
import { IUserRepository } from "../interface/IUserRepository";
import { IJwtService } from "../interface/IJwtService";
import { IOtpRepository } from "../interface/IOtpRepository";
import { IOtpService } from "../interface/IOtpService";

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
      throw new Error("User does not exist. Please create an account.");
    }

    if (user.getRole() === "admin") {
      throw new Error("Admin accounts cannot log in as a student. Please use the Admin Login.");
    }

    const hashedPassword = await user.getPassword();
    if (!hashedPassword) {
      throw new Error("Password not found.");
    }

    const isMatch = await this.passwordService.compare(
      password,
      hashedPassword,
    );

    if (!isMatch) {
      throw new Error("Password doesn't match.");
    }

    // Enforce OTP verification: check if user isVerified is true
    if (!user.isEmailVerified()) {
      const otp = this.otpService.generateOtp();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      await this.otpRepository.saveOtp(email, otp, expiresAt);
      await this.otpService.sendOtp(email, otp);

      const err: any = new Error(
        "Account is not verified. An OTP code has been sent to your email.",
      );
      err.requireOtp = true;
      err.email = email;
      throw err;
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
