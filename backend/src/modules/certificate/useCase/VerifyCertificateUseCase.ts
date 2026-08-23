import type { ICertificateRepository } from "../interface/ICertificateRepository";

export interface PublicCertificateVerificationDto {
  valid: boolean;
  certificateId: string;
  studentName: string;
  courseTitle: string;
  issuedAt: Date;
  completionDate: Date;
  status: string;
}

export class VerifyCertificateUseCase {
  constructor(private readonly certificateRepository: ICertificateRepository) {}

  async execute(certificateId: string): Promise<PublicCertificateVerificationDto> {
    if (!certificateId) throw new Error("Certificate ID is required.");

    const cert = await this.certificateRepository.findByCertificateId(certificateId);

    if (!cert || cert.status !== "valid") {
      return {
        valid: false,
        certificateId,
        studentName: "",
        courseTitle: "",
        issuedAt: new Date(0),
        completionDate: new Date(0),
        status: "invalid",
      };
    }

    return {
      valid: true,
      certificateId: cert.certificateId,
      studentName: cert.studentName,
      courseTitle: cert.courseTitle,
      issuedAt: cert.issuedAt,
      completionDate: cert.completionDate,
      status: cert.status,
    };
  }
}
