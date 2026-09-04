import type {
  ICertificateRepository,
  CertificateDto,
} from "../interface/ICertificateRepository";
import { UnauthorizedError } from "../../../core/errors/AppError";

export class GetUserCertificatesUseCase {
  constructor(private readonly certificateRepository: ICertificateRepository) {}

  async execute(userId: string): Promise<CertificateDto[]> {
    if (!userId) throw new UnauthorizedError();
    return this.certificateRepository.findByStudent(userId);
  }
}

