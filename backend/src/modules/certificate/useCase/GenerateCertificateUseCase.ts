import type {
  ICertificateRepository,
  CertificateDto,
} from "../interface/ICertificateRepository";
import { CourseModel } from "../../course/repository/database/Course";
import { EnrollmentModel } from "../../admin/Repository/database/Enrollment";
import { LessonModel } from "../../curriculum/database/Lesson";
import { LessonProgressModel } from "../../progress/database/LessonProgress";
import { UserModel } from "../../auth/Repository/database/User";

export interface GenerateCertificateInput {
  userId: string;
  courseId: string;
}

export class GenerateCertificateUseCase {
  constructor(private readonly certificateRepository: ICertificateRepository) {}

  async execute(input: GenerateCertificateInput): Promise<CertificateDto> {
    const { userId, courseId } = input;

    if (!userId) throw new Error("Authentication required.");
    if (!courseId) throw new Error("Course ID is required.");

    // 1. Check if certificate already exists (Idempotent return!)
    const existingCert = await this.certificateRepository.findByStudentAndCourse(
      userId,
      courseId,
    );
    if (existingCert) {
      return existingCert;
    }

    // 2. Validate course existence
    const course = await CourseModel.findOne({ id: courseId });
    if (!course) throw new Error("Course not found.");

    // 3. Validate enrollment
    const enrollment = await EnrollmentModel.findOne({
      studentId: userId,
      courseId,
      status: "completed",
    });
    if (!enrollment) {
      throw new Error("Access denied. Completed enrollment required to generate certificate.");
    }

    // 4. Validate course lessons
    const totalLessons = await LessonModel.countDocuments({ courseId });
    if (totalLessons === 0) {
      throw new Error("Cannot generate certificate for a course with zero published lessons.");
    }

    // 5. Validate course completion = 100%
    const completedCount = await LessonProgressModel.countDocuments({
      studentId: userId,
      courseId,
      completed: true,
    });

    if (completedCount < totalLessons) {
      const pct = Math.round((completedCount / totalLessons) * 100);
      throw new Error(
        `Course incomplete (${completedCount}/${totalLessons} lessons completed, ${pct}%). 100% completion required for certificate issuance.`,
      );
    }

    // 6. Get student's display name
    const userDoc = await UserModel.findOne({ id: userId });
    const studentName = userDoc?.name || enrollment.studentName || "Student";

    // 7. Create certificate
    return this.certificateRepository.createCertificate({
      studentId: userId,
      studentName,
      courseId,
      courseTitle: course.title,
      completionDate: new Date(),
    });
  }
}
