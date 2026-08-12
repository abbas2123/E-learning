import { UserRepository } from "../../auth/Repository/repository/UserRepository";
import { CloudinaryService } from "../../../cloudinary/CloudinaryService";
import { UpdateProfileUseCase } from "../useCase/UpdateProfileUseCase";
import { ProfileController } from "../controllers/ProfileController";
import { ChangePasswordUseCase } from "../useCase/ChangePasswordUseCase";
import { PasswordService } from "../../auth/Repository/services/PasswordService";

const userRepository = new UserRepository();

const cloudinaryService = new CloudinaryService();
const passowrdServie = new PasswordService();
const updateProfileUseCase = new UpdateProfileUseCase(userRepository);
const changePasswordUseCase = new ChangePasswordUseCase(
  userRepository,
  passowrdServie,
);
export const profileController = new ProfileController(
  updateProfileUseCase,
  cloudinaryService,
  changePasswordUseCase,
);
