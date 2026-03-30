import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireCreator } from "../middleware/roleMiddleware.js";
import {
  applyToCourse,
  getMyApplications,
  getCourseApplicationsForCreator,
  updateApplicationStatus,
} from "../controllers/courseApplicationsController.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/my", getMyApplications);

router.post("/courses/:courseId/apply", applyToCourse);

router.get("/courses/:courseId", requireCreator, getCourseApplicationsForCreator);

router.put("/:applicationId/status", requireCreator, updateApplicationStatus);

export default router;
