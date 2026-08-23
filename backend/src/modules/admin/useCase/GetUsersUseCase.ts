import type { IAdminRepository } from "../interface/IAdminRepository";
import type { AdminUserDto } from "../dtos/AdminUserDto";

export class GetUsersUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(): Promise<AdminUserDto[]> {
    return this.adminRepository.getUsers();
  }
}
