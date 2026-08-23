import { CertificateModel } from "../database/Certificate";
import type { CertificateDto } from "../interface/ICertificateRepository";

export class RevokeCertificateUseCase {
  async execute(certificateId: string, adminUserId: string): Promise<CertificateDto> {
    if (!certificateId) throw new Error("Certificate ID is required.");
    if (!adminUserId) throw new Error("Admin user ID is required.");

    const cert = await CertificateModel.findOne({
      $or: [{ id: certificateId }, { certificateId }],
    });

    if (!cert) {
      throw Object.assign(new Error("Certificate not found."), { statusCode: 404 });
    }

    if (cert.status === "revoked") {
      throw Object.assign(new Error("Certificate is already revoked."), { statusCode: 400 });
    }

    cert.status = "revoked";
    await cert.save();

    return {
      id: cert.id,
      certificateId: cert.certificateId,
      studentId: cert.studentId,
      studentName: cert.studentName,
      courseId: cert.courseId,
      courseTitle: cert.courseTitle,
      issuedAt: cert.issuedAt,
      completionDate: cert.completionDate,
      verificationUrl: cert.verificationUrl,
      pdfUrl: cert.pdfUrl ?? null,
      status: cert.status as "valid" | "revoked",
    };
  }
}
