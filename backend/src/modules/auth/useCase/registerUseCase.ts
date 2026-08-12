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
  ADMIN = "admin",
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
      throw new Error("User already exists.");
    }

    const hashedPassword = await this.PasswordService.hash(password);

    const newUser = User.create({
      id: randomUUID(),
      name: name,
      email: email,
      password: hashedPassword,
      role: UserRole.STUDENT,
      provider: AuthProvider.LOCAL,
    });

    const savedUser = await this.UserRepository.create(newUser);
    console.log("saveduser", savedUser);
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
