import { CertificateRepository } from "../repository/CertificateRepository";
import { CertificatePdfService } from "../service/CertificatePdfService";
import { GenerateCertificateUseCase } from "../useCase/GenerateCertificateUseCase";
import { GetCertificateUseCase } from "../useCase/GetCertificateUseCase";
import { GetUserCertificatesUseCase } from "../useCase/GetUserCertificatesUseCase";
import { VerifyCertificateUseCase } from "../useCase/VerifyCertificateUseCase";
import { RevokeCertificateUseCase } from "../useCase/RevokeCertificateUseCase";
import { CertificateController } from "../controller/CertificateController";

export function createCertificateContainer() {
  const repository = new CertificateRepository();
  const pdfService = new CertificatePdfService();

  const generateCertificateUseCase = new GenerateCertificateUseCase(repository);
  const getCertificateUseCase = new GetCertificateUseCase(repository);
  const getUserCertificatesUseCase = new GetUserCertificatesUseCase(repository);
  const verifyCertificateUseCase = new VerifyCertificateUseCase(repository);
  const revokeCertificateUseCase = new RevokeCertificateUseCase();

  const controller = new CertificateController(
    generateCertificateUseCase,
    getCertificateUseCase,
    getUserCertificatesUseCase,
    verifyCertificateUseCase,
    revokeCertificateUseCase,
    pdfService,
    repository,
  );

  return { controller };
}
