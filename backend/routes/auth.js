import express from "express"
import { getMe, login, register, updateMe, updatePassword } from "../controllers/authController.js"
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router()

router.post("/register", register)
router.post("/login", login)
router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateMe);
router.put("/change-password", authMiddleware, updatePassword);

export default router