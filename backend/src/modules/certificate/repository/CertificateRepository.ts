import { randomUUID, randomBytes } from "crypto";
import { CertificateModel } from "../database/Certificate";
import type {
  ICertificateRepository,
  CertificateDto,
  CreateCertificateParams,
} from "../interface/ICertificateRepository";

export class CertificateRepository implements ICertificateRepository {
  private toDto(doc: any): CertificateDto {
    return {
      id: doc.id ?? doc._id.toString(),
      certificateId: doc.certificateId,
      studentId: doc.studentId,
      studentName: doc.studentName,
      courseId: doc.courseId,
      courseTitle: doc.courseTitle,
      issuedAt: new Date(doc.issuedAt),
      completionDate: new Date(doc.completionDate),
      verificationUrl: doc.verificationUrl,
      pdfUrl: doc.pdfUrl ?? null,
      status: doc.status ?? "valid",
    };
  }

  private generateCertificateNumber(): string {
    const year = new Date().getFullYear();
    const hex = randomBytes(4).toString("hex").toUpperCase();
    return `TOTC-CERT-${year}-${hex}`;
  }

  async createCertificate(params: CreateCertificateParams): Promise<CertificateDto> {
    const { studentId, studentName, courseId, courseTitle, completionDate, verificationBaseUrl } =
      params;

    // Check if already created for race-condition protection
    const existing = await CertificateModel.findOne({ studentId, courseId });
    if (existing) {
      return this.toDto(existing);
    }

    const id = randomUUID();
    const certificateId = this.generateCertificateNumber();
    const clientUrl = verificationBaseUrl || process.env.CLIENT_URL || "http://localhost:5173";
    const verificationUrl = `${clientUrl}/certificates/verify/${certificateId}`;

    const doc = await CertificateModel.create({
      id,
      certificateId,
      studentId,
      studentName,
      courseId,
      courseTitle,
      issuedAt: new Date(),
      completionDate: completionDate || new Date(),
      verificationUrl,
      pdfUrl: `/api/certificates/${certificateId}/download`,
      status: "valid",
    });

    return this.toDto(doc);
  }

  async findByCertificateId(certificateId: string): Promise<CertificateDto | null> {
    const doc = await CertificateModel.findOne({ certificateId });
    if (!doc) return null;
    return this.toDto(doc);
  }

  async findByStudentAndCourse(
    studentId: string,
    courseId: string,
  ): Promise<CertificateDto | null> {
    const doc = await CertificateModel.findOne({ studentId, courseId });
    if (!doc) return null;
    return this.toDto(doc);
  }

  async findByStudent(studentId: string): Promise<CertificateDto[]> {
    const docs = await CertificateModel.find({ studentId }).sort({ issuedAt: -1 });
    return docs.map((d) => this.toDto(d));
  }
}
