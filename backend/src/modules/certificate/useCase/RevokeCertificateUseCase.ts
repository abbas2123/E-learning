import { CertificateModel } from "../database/Certificate";
import type { CertificateDto } from "../interface/ICertificateRepository";
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../../core/errors/AppError";

export class RevokeCertificateUseCase {
  async execute(certificateId: string, adminUserId: string): Promise<CertificateDto> {
    if (!certificateId) throw new ValidationError("Certificate ID is required.");
    if (!adminUserId) throw new UnauthorizedError("Admin user ID is required.");

    const cert = await CertificateModel.findOne({
      $or: [{ id: certificateId }, { certificateId }],
    });

    if (!cert) {
      throw new NotFoundError("Certificate not found.", "CERTIFICATE_NOT_FOUND");
    }

    if (cert.status === "revoked") {
      throw new ConflictError("Certificate is already revoked.", "CERTIFICATE_ALREADY_REVOKED");
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
