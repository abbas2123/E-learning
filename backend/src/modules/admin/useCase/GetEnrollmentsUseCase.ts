import type { IAdminRepository } from "../interface/IAdminRepository";
import type { AdminEnrollmentDto } from "../dtos/AdminEnrollmentDto";

export class GetEnrollmentsUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(): Promise<AdminEnrollmentDto[]> {
    return this.adminRepository.getEnrollments();
  }
}
