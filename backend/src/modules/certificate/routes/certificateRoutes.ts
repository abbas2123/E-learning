import { Router } from "express";
import { createCertificateContainer } from "../composition/certificateContainer";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { adminMiddleware } from "../../../middlewares/adminMiddleware";

const router = Router();
const { controller } = createCertificateContainer();

// 1. PUBLIC: Verify certificate by certificateId
router.get(
  "/certificates/verify/:certificateId",
  (req, res, next) => controller.verifyCertificate(req, res, next),
);

// 2. PUBLIC / STREAM: Download certificate PDF stream
router.get(
  "/certificates/:certificateId/download",
  (req, res, next) => controller.downloadPdf(req, res, next),
);

// 3. AUTH: Generate certificate (idempotent)
router.post(
  "/certificates/generate",
  authMiddleware,
  (req, res, next) => controller.generateCertificate(req, res, next),
);

// 4. AUTH: Get all certificates belonging to authenticated student
router.get(
  "/certificates/my-certificates",
  authMiddleware,
  (req, res, next) => controller.getUserCertificates(req, res, next),
);

// 5. AUTH: Get specific certificate details (owner / admin)
router.get(
  "/certificates/:certificateId",
  authMiddleware,
  (req, res, next) => controller.getCertificateDetails(req, res, next),
);

// 6. ADMIN: Revoke certificate
router.patch(
  "/certificates/:certificateId/revoke",
  authMiddleware,
  adminMiddleware,
  (req, res, next) => controller.revokeCertificate(req, res, next),
);

export default router;
