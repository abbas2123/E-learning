import type {
  ICertificateRepository,
  CertificateDto,
} from "../interface/ICertificateRepository";
import type { ICourseRepository } from "../../course/interface/ICourseRepository";
import type { IEnrollmentRepository } from "../../admin/interface/IEnrollmentRepository";
import type { IUserRepository } from "../../auth/interface/IUserRepository";
import type { GetCertificateStatusUseCase } from "./GetCertificateStatusUseCase";

export interface GenerateCertificateInput {
  userId: string;
  courseId: string;
  userRole?: string;
}

export class GenerateCertificateUseCase {
  constructor(
    private readonly certificateRepository: ICertificateRepository,
    private readonly courseRepository: ICourseRepository,
    private readonly enrollmentRepository: IEnrollmentRepository,
    private readonly userRepository: IUserRepository,
    private readonly statusUseCase: GetCertificateStatusUseCase,
  ) {}

  async execute(input: GenerateCertificateInput): Promise<CertificateDto> {
    const { userId, courseId, userRole } = input;

    if (!userId) throw new Error("Authentication required.");
    if (!courseId) throw new Error("Course ID is required.");

    // 1. Idempotent: return existing certificate without re-generating
    const existingCert = await this.certificateRepository.findByStudentAndCourse(userId, courseId);
    if (existingCert) {
      return existingCert;
    }

    // 2. Validate course existence via repository
    const course = await this.courseRepository.findSummaryById(courseId);
    if (!course) throw new Error("Course not found.");

    // 3. Server-side eligibility check — cannot be bypassed by client
    const status = await this.statusUseCase.execute({ userId, courseId, userRole });

    if (!status.eligible) {
      const reasonMsg =
        status.reasons.length > 0
          ? status.reasons.join(" ")
          : "Course completion requirements have not been met.";
      throw new Error(`Certificate Ineligible: ${reasonMsg}`);
    }

    // 4. Resolve student name from user repository, with enrollment as fallback
    const userEntity = await this.userRepository.findById(userId);
    let studentName = userEntity?.getName() ?? "";

    if (!studentName) {
      const enrollment = await this.enrollmentRepository.findCompletedByStudentAndCourse(
        userId,
        courseId,
      );
      studentName = enrollment?.studentName ?? "Student";
    }

    // 5. Issue certificate (database unique index prevents duplicates)
    return this.certificateRepository.createCertificate({
      studentId: userId,
      studentName,
      courseId,
      courseTitle: course.title,
      completionDate: new Date(),
    });
  }
}
