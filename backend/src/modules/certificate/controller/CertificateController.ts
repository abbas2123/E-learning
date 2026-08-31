import type { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../../../middlewares/authMiddleware";
import type { GetCertificateStatusUseCase } from "../useCase/GetCertificateStatusUseCase";
import type { GenerateCertificateUseCase } from "../useCase/GenerateCertificateUseCase";
import type { GetCertificateUseCase } from "../useCase/GetCertificateUseCase";
import type { GetUserCertificatesUseCase } from "../useCase/GetUserCertificatesUseCase";
import type { VerifyCertificateUseCase } from "../useCase/VerifyCertificateUseCase";
import type { RevokeCertificateUseCase } from "../useCase/RevokeCertificateUseCase";
import type { CertificatePdfService } from "../service/CertificatePdfService";
import type { ICertificateRepository } from "../interface/ICertificateRepository";

export class CertificateController {
  constructor(
    private readonly getCertificateStatusUseCase: GetCertificateStatusUseCase,
    private readonly generateCertificateUseCase: GenerateCertificateUseCase,
    private readonly getCertificateUseCase: GetCertificateUseCase,
    private readonly getUserCertificatesUseCase: GetUserCertificatesUseCase,
    private readonly verifyCertificateUseCase: VerifyCertificateUseCase,
    private readonly revokeCertificateUseCase: RevokeCertificateUseCase,
    private readonly pdfService: CertificatePdfService,
    private readonly repository: ICertificateRepository,
  ) {}

  async getCertificateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const userRole = req.userRole;
      const courseId = String(req.params.courseId);

      const status = await this.getCertificateStatusUseCase.execute({
        userId,
        courseId,
        userRole,
      });

      return res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      next(error);
    }
  }

  async generateCertificate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const courseId = String(req.body.courseId);

      const cert = await this.generateCertificateUseCase.execute({
        userId,
        courseId,
      });

      return res.status(201).json({
        success: true,
        data: cert,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserCertificates(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.userId!;
      const certs = await this.getUserCertificatesUseCase.execute(userId);

      return res.status(200).json({
        success: true,
        data: certs,
      });
    } catch (error) {
      next(error);
    }
  }

  async verifyCertificate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const certificateId = String(req.params.certificateId);
      const verification = await this.verifyCertificateUseCase.execute(certificateId);

      if (!verification.valid) {
        return res.status(404).json({
          success: false,
          data: verification,
          message: "Certificate not found or invalid.",
        });
      }

      return res.status(200).json({
        success: true,
        data: verification,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCertificateDetails(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const certificateId = String(req.params.certificateId);
      const userId = req.userId!;
      const userRole = req.userRole;

      const cert = await this.getCertificateUseCase.execute({
        certificateId,
        userId,
        userRole,
      });

      return res.status(200).json({
        success: true,
        data: cert,
      });
    } catch (error) {
      next(error);
    }
  }

  async revokeCertificate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const certificateId = String(req.params.certificateId);
      const adminUserId = req.userId!;

      const cert = await this.revokeCertificateUseCase.execute(certificateId, adminUserId);
      return res.status(200).json({
        success: true,
        message: "Certificate successfully revoked.",
        data: cert,
      });
    } catch (error) {
      next(error);
    }
  }

  async downloadPdf(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const certificateId = String(req.params.certificateId);
      const cert = await this.repository.findByCertificateId(certificateId);

      if (!cert || cert.status !== "valid") {
        return res.status(404).json({
          success: false,
          message: "Certificate not found or revoked.",
        });
      }

      const pdfBuffer = await this.pdfService.generatePdfBuffer(cert);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${cert.certificateId}.pdf"`,
      );
      return res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }
}
