import express from "express";
import { getAllUsers, updateUserRole } from "../controllers/adminController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);

export default router;