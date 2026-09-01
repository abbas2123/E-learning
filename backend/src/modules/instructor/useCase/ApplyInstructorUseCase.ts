import type { IUserRepository } from "../../auth/interface/IUserRepository";
import type { INotificationRepository } from "../../admin/interface/INotificationRepository";

export interface ApplyInstructorInput {
  userId: string;
  bio?: string;
  expertise?: string;
  experience?: string;
  sampleVideoUrl?: string;
}

export interface ApplyInstructorResult {
  success: boolean;
  message: string;
  status: "active" | "pending_review";
}

export class ApplyInstructorUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly notificationRepository: INotificationRepository,
  ) {}

  async execute(input: ApplyInstructorInput): Promise<ApplyInstructorResult> {
    const { userId, expertise } = input;

    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error("User not found.");

    const currentRole = user.getRole();
    if (currentRole === "instructor" || currentRole === "admin") {
      return {
        success: true,
        message: "You already have instructor access.",
        status: "active",
      };
    }

    await this.notificationRepository.createNotification({
      title: "Instructor Application Received",
      message: `${user.getName()} (${user.getEmail()}) applied to become an Instructor. Expertise: ${expertise || "General"}.`,
      type: "approval",
      userId: null,
      read: false,
    });

    return {
      success: true,
      message: "Application submitted successfully! Administrators will review your profile.",
      status: "pending_review",
    };
  }
}
