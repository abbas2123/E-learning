import type {
  ICertificateRepository,
  CertificateDto,
} from "../interface/ICertificateRepository";

export interface GetCertificateInput {
  certificateId: string;
  userId: string;
  userRole?: string;
}

export class GetCertificateUseCase {
  constructor(private readonly certificateRepository: ICertificateRepository) {}

  async execute(input: GetCertificateInput): Promise<CertificateDto> {
    const { certificateId, userId, userRole } = input;

    if (!certificateId) throw new Error("Certificate ID is required.");
    if (!userId) throw new Error("Authentication required.");

    const cert = await this.certificateRepository.findByCertificateId(certificateId);
    if (!cert) throw new Error("Certificate not found.");

    if (cert.studentId !== userId && userRole !== "admin") {
      throw new Error("Access denied. You can only view your own certificate details.");
    }

    return cert;
  }
}
