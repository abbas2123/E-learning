import { EnrollmentModel } from "../database/Enrollment";
import type { IEnrollmentRepository, EnrollmentDto } from "../../interface/IEnrollmentRepository";

export class EnrollmentRepository implements IEnrollmentRepository {
  private toDto(doc: any): EnrollmentDto {
    return {
      id: doc.id ?? doc._id.toString(),
      studentId: doc.studentId,
      studentName: doc.studentName,
      studentEmail: doc.studentEmail,
      courseId: doc.courseId,
      courseTitle: doc.courseTitle,
      amountPaid: doc.amountPaid ?? 0,
      paymentMethod: doc.paymentMethod ?? "Stripe",
      status: doc.status ?? "completed",
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async findByStudentAndCourse(studentId: string, courseId: string): Promise<EnrollmentDto | null> {
    const doc = await EnrollmentModel.findOne({ studentId, courseId });
    if (!doc) return null;
    return this.toDto(doc);
  }

  async findCompletedByStudentAndCourse(
    studentId: string,
    courseId: string,
  ): Promise<EnrollmentDto | null> {
    const doc = await EnrollmentModel.findOne({
      studentId,
      courseId,
      status: "completed",
    });
    if (!doc) return null;
    return this.toDto(doc);
  }

  async isStudentEnrolled(studentId: string, courseId: string): Promise<boolean> {
    const count = await EnrollmentModel.countDocuments({
      studentId,
      courseId,
      status: "completed",
    });
    return count > 0;
  }

  async findByStudentId(studentId: string): Promise<EnrollmentDto[]> {
    const docs = await EnrollmentModel.find({ studentId }).sort({ createdAt: -1 });
    return docs.map((d) => this.toDto(d));
  }

  async findByCourseId(courseId: string): Promise<EnrollmentDto[]> {
    const docs = await EnrollmentModel.find({ courseId }).sort({ createdAt: -1 });
    return docs.map((d) => this.toDto(d));
  }
}
