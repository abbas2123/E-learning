import type { IAdminRepository } from "../interface/IAdminRepository";
import type { AdminUserDto } from "../dtos/AdminUserDto";
import type { CreateUserDto } from "../dtos/CreateUserDto";
import { ValidationError } from "../../../core/errors/AppError";

export class CreateUserUseCase {
  constructor(private readonly adminRepository: IAdminRepository) {}

  async execute(dto: CreateUserDto): Promise<AdminUserDto> {
    if (!dto.name || !dto.email || !dto.role) {
      throw new ValidationError("Name, email, and role are required.");
    }
    return this.adminRepository.createUser(dto);
  }
}

