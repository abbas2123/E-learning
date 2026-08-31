export interface EnrollmentDto {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  courseId: string;
  courseTitle: string;
  amountPaid: number;
  paymentMethod: string;
  status: "completed" | "refunded" | "pending";
  createdAt: Date;
  updatedAt: Date;
}

export interface IEnrollmentRepository {
  findByStudentAndCourse(studentId: string, courseId: string): Promise<EnrollmentDto | null>;
  findCompletedByStudentAndCourse(studentId: string, courseId: string): Promise<EnrollmentDto | null>;
  isStudentEnrolled(studentId: string, courseId: string): Promise<boolean>;
  findByStudentId(studentId: string): Promise<EnrollmentDto[]>;
  findByCourseId(courseId: string): Promise<EnrollmentDto[]>;
}
