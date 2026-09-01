import type {
  ICertificateRepository,
  CertificateDto,
} from "../interface/ICertificateRepository";
import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../../../core/errors/AppError";

export interface GetCertificateInput {
  certificateId: string;
  userId: string;
  userRole?: string;
}

export class GetCertificateUseCase {
  constructor(private readonly certificateRepository: ICertificateRepository) {}

  async execute(input: GetCertificateInput): Promise<CertificateDto> {
    const { certificateId, userId, userRole } = input;

    if (!certificateId)
      throw new ValidationError("Certificate ID is required.");
    if (!userId) throw new UnauthorizedError();

    const cert =
      await this.certificateRepository.findByCertificateId(certificateId);
    if (!cert)
      throw new NotFoundError(
        "Certificate not found.",
        "CERTIFICATE_NOT_FOUND",
      );

    if (cert.studentId !== userId && userRole !== "admin") {
      throw new ForbiddenError("You are not allowed to view this certificate.");
    }

    return cert;
  }
}
