import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getMyNotifications, markNotificationRead } from "../controllers/notificationsController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/my", getMyNotifications);
router.put("/:id/read", markNotificationRead);

export default router;
