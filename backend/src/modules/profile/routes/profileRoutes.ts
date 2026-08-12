import { Router } from "express";
import { profileController } from "../composition/profile.container";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import { upload } from "../../../middlewares/uploadMiddleware";

const router = Router();

router.patch(
  "/",
  authMiddleware,
  upload.single("avatar"),
  profileController.updateProfile.bind(profileController),
);
router.patch(
  "/password",
  authMiddleware,
  profileController.changePassword.bind(profileController),
);

export default router;
