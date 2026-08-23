export type AdminEnrollmentDto = {
  id: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  amountPaid: number;
  paymentMethod: string;
  status: string;
  enrolledAt?: string | Date;
};
