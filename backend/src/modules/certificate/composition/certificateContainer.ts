import { CertificateRepository } from "../repository/CertificateRepository";
import { CertificatePdfService } from "../service/CertificatePdfService";
import { GenerateCertificateUseCase } from "../useCase/GenerateCertificateUseCase";
import { GetCertificateStatusUseCase } from "../useCase/GetCertificateStatusUseCase";
import { GetCertificateUseCase } from "../useCase/GetCertificateUseCase";
import { GetUserCertificatesUseCase } from "../useCase/GetUserCertificatesUseCase";
import { VerifyCertificateUseCase } from "../useCase/VerifyCertificateUseCase";
import { RevokeCertificateUseCase } from "../useCase/RevokeCertificateUseCase";
import { CertificateController } from "../controller/CertificateController";

// Cross-module repository dependencies (injected, not imported as models)
import { CourseRepository } from "../../course/repository/repository/CourseRepository";
import { EnrollmentRepository } from "../../admin/Repository/repository/EnrollmentRepository";
import { LessonRepository } from "../../curriculum/repository/LessonRepository";
import { LessonProgressRepository } from "../../progress/repository/LessonProgressRepository";
import { QuizRepository } from "../../quiz/repository/QuizRepository";
import { QuizAttemptRepository } from "../../quiz/repository/QuizAttemptRepository";
import { UserRepository } from "../../auth/Repository/repository/UserRepository";

export function createCertificateContainer() {
  // Infrastructure repositories
  const certificateRepository = new CertificateRepository();
  const courseRepository = new CourseRepository();
  const enrollmentRepository = new EnrollmentRepository();
  const lessonRepository = new LessonRepository();
  const progressRepository = new LessonProgressRepository();
  const quizRepository = new QuizRepository();
  const attemptRepository = new QuizAttemptRepository();
  const userRepository = new UserRepository();
  const pdfService = new CertificatePdfService();

  // Status use case depends on all read-only repositories — built first
  const getCertificateStatusUseCase = new GetCertificateStatusUseCase(
    certificateRepository,
    courseRepository,
    enrollmentRepository,
    lessonRepository,
    progressRepository,
    quizRepository,
    attemptRepository,
  );

  // Generate use case receives status use case via constructor injection
  const generateCertificateUseCase = new GenerateCertificateUseCase(
    certificateRepository,
    courseRepository,
    enrollmentRepository,
    userRepository,
    getCertificateStatusUseCase,
  );

  const getCertificateUseCase = new GetCertificateUseCase(certificateRepository);
  const getUserCertificatesUseCase = new GetUserCertificatesUseCase(certificateRepository);
  const verifyCertificateUseCase = new VerifyCertificateUseCase(certificateRepository);
  const revokeCertificateUseCase = new RevokeCertificateUseCase();

  const controller = new CertificateController(
    getCertificateStatusUseCase,
    generateCertificateUseCase,
    getCertificateUseCase,
    getUserCertificatesUseCase,
    verifyCertificateUseCase,
    revokeCertificateUseCase,
    pdfService,
    certificateRepository,
  );

  return { controller };
}
