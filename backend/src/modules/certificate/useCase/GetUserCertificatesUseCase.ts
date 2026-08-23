import type {
  ICertificateRepository,
  CertificateDto,
} from "../interface/ICertificateRepository";

export class GetUserCertificatesUseCase {
  constructor(private readonly certificateRepository: ICertificateRepository) {}

  async execute(userId: string): Promise<CertificateDto[]> {
    if (!userId) throw new Error("Authentication required.");
    return this.certificateRepository.findByStudent(userId);
  }
}
