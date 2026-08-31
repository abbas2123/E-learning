import { User } from "../userEnitity/User";
import { IUserRepository } from "../interface/IUserRepository";
import { IPasswordService } from "../interface/IPasswordService";
import { RegisterUserDto } from "../dtos/RegisterUserDto";
import { IOtpRepository } from "../interface/IOtpRepository";
import { IOtpService } from "../interface/IOtpService";
import { randomUUID } from "crypto";

enum UserRole {
  STUDENT = "student",
  INSTRUCTOR = "instructor",
}

enum AuthProvider {
  LOCAL = "local",
  GOOGLE = "google",
}

export class RegisterUseCase {
  constructor(
    private UserRepository: IUserRepository,
    private PasswordService: IPasswordService,
    private OtpRepository: IOtpRepository,
    private OtpService: IOtpService,
  ) {}

  async execute(dto: RegisterUserDto) {
    const { name, email, password } = dto;

    const existingUser = await this.UserRepository.findByEmail(email);
    if (existingUser) {
      if (existingUser.isEmailVerified()) {
        throw new Error("User with this email already exists. Please log in.");
      }

      // If user is unverified, update credentials, generate fresh OTP, and return requireOtp
      const hashedPassword = await this.PasswordService.hash(password);
      const assignedRole = dto.role === "instructor" ? UserRole.INSTRUCTOR : UserRole.STUDENT;

      if (name) {
        existingUser.updateProfile(name);
      }
      existingUser.changePassword(hashedPassword);
      existingUser.changeRole(assignedRole);

      const savedUser = await this.UserRepository.update(existingUser);

      // Generate & send fresh OTP code
      const otp = this.OtpService.generateOtp();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
      const hashedOtp = await this.PasswordService.hash(otp);
      await this.OtpRepository.saveOtp(email, hashedOtp, expiresAt);
      await this.OtpService.sendOtp(email, otp);

      return {
        user: savedUser,
        requireOtp: true,
        email: savedUser.getEmail(),
        message: "Account already exists but is unverified. A new verification OTP code has been sent to your email.",
      };
    }

    const hashedPassword = await this.PasswordService.hash(password);

    const assignedRole = dto.role === "instructor" ? UserRole.INSTRUCTOR : UserRole.STUDENT;

    const newUser = User.create({
      id: randomUUID(),
      name: name,
      email: email,
      password: hashedPassword,
      role: assignedRole,
      provider: AuthProvider.LOCAL,
    });

    const savedUser = await this.UserRepository.create(newUser);

    // Generate & send OTP code
    const otp = this.OtpService.generateOtp();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    const hashedOtp = await this.PasswordService.hash(otp);
    await this.OtpRepository.saveOtp(email, hashedOtp, expiresAt);
    await this.OtpService.sendOtp(email, otp);

    return {
      user: savedUser,
      requireOtp: true,
      email: savedUser.getEmail(),
      message: "Registration successful. Please verify your OTP code.",
    };
  }
}
