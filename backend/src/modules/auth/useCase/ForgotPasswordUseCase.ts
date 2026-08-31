import { IOtpRepository } from "../interface/IOtpRepository";
import { IUserRepository } from "../interface/IUserRepository";
import { IPasswordService } from "../interface/IPasswordService";
import { IOtpService } from "../interface/IOtpService";
export class ForgotPassUseCase {
  constructor(
    private userRepo: IUserRepository,
    private otprepo: IOtpRepository,
    private passowrdServie: IPasswordService,
    private otpService: IOtpService,
  ) {}

  async execute(dto: { email: string }) {
    const email = dto.email;

    const findUser = this.userRepo.findByEmail(email);
    if (!findUser) {
      throw Error("User not found");
    }
    const otp = this.otpService.generateOtp();
    const hashedOtp = await this.passowrdServie.hash(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await this.otprepo.saveOtp(email, hashedOtp, expiresAt);
    await this.otpService.sendOtp(email, otp);
  }
}
