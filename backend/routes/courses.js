import { 
  showAllCourses, 
  getUpcomingCourses,
  getWeekCourses,
  getMyCreatedCourses,
  getMyMemberCourses,
  createNewCourse, 
  updateCourse, 
  deleteCourse, 
  showCourse 
} from "../controllers/coursesController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireCreator } from "../middleware/roleMiddleware.js"
import express from "express"

const router = express.Router();

router.get("/my-created", authMiddleware, requireCreator, getMyCreatedCourses)

router.get("/my", authMiddleware, getMyMemberCourses)

router.get("/upcoming", getUpcomingCourses)

router.get("/week", getWeekCourses)

router.get("/", showAllCourses)

router.post("/", authMiddleware, requireCreator, createNewCourse);

router.delete("/:id", authMiddleware, requireCreator, deleteCourse);

router.put("/:id", authMiddleware, requireCreator, updateCourse);

router.get("/:id", showCourse)

export default router