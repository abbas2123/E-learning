export interface CertificateDto {
  id: string;
  certificateId: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  issuedAt: Date;
  completionDate: Date;
  verificationUrl: string;
  pdfUrl: string | null;
  status: "valid" | "revoked";
}

export interface CreateCertificateParams {
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  completionDate?: Date;
  verificationBaseUrl?: string;
}

export interface ICertificateRepository {
  createCertificate(params: CreateCertificateParams): Promise<CertificateDto>;
  findByCertificateId(certificateId: string): Promise<CertificateDto | null>;
  findByStudentAndCourse(
    studentId: string,
    courseId: string,
  ): Promise<CertificateDto | null>;
  findByStudent(studentId: string): Promise<CertificateDto[]>;
}
