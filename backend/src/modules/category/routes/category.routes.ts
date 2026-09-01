import { Router } from "express";
import { adminController } from "../../admin/composition/admin.container";

const router = Router();

// Public endpoint to get all active categories created by Admin
router.get("/", (req, res, next) => adminController.getCategories(req, res, next));

export default router;
