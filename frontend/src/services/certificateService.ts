import apiClient from "./apiClient";

export interface CertificateData {
  id: string;
  certificateId: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseTitle: string;
  issuedAt: string;
  completionDate: string;
  verificationUrl: string;
  pdfUrl: string | null;
  status: "valid" | "revoked";
}

export interface PublicVerificationData {
  valid: boolean;
  certificateId: string;
  studentName: string;
  courseTitle: string;
  issuedAt: string;
  completionDate: string;
  status: string;
}

export interface CertificateStatusData {
  eligible: boolean;
  certificate: CertificateData | null;
  progress: {
    completedLessons: number;
    totalLessons: number;
    completedQuizzes: number;
    totalQuizzes: number;
    progressPercentage: number;
  };
  score: {
    current: number;
    required: number;
    passed: boolean;
  };
  reasons: string[];
}

export const certificateService = {
  async getCertificateStatus(courseId: string): Promise<CertificateStatusData> {
    const res = await apiClient.get<{ success: boolean; data: CertificateStatusData }>(
      `/api/certificates/courses/${courseId}/status`,
    );
    return res.data.data;
  },

  async generateCertificate(courseId: string): Promise<CertificateData> {
    const res = await apiClient.post<{ success: boolean; data: CertificateData }>(
      "/api/certificates/generate",
      { courseId },
    );
    return res.data.data;
  },

  async getUserCertificates(): Promise<CertificateData[]> {
    const res = await apiClient.get<{ success: boolean; data: CertificateData[] }>(
      "/api/certificates/my-certificates",
    );
    return res.data.data;
  },

  async getCertificateDetails(certificateId: string): Promise<CertificateData> {
    const res = await apiClient.get<{ success: boolean; data: CertificateData }>(
      `/api/certificates/${certificateId}`,
    );
    return res.data.data;
  },

  async verifyCertificate(certificateId: string): Promise<PublicVerificationData> {
    const res = await apiClient.get<{ success: boolean; data: PublicVerificationData }>(
      `/api/certificates/verify/${certificateId}`,
    );
    return res.data.data;
  },

  getDownloadUrl(certificateId: string): string {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    return `${baseUrl}/api/certificates/${certificateId}/download`;
  },
};

export default certificateService;
