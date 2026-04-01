import { 
  showAllCourses, 
  getUpcomingCourses,
  getWeekCourses,
  getMyCreatedCourses,
  getMyMemberCourses,
  createNewCourse, 
  updateCourse, 
  deleteCourse, 
  showCourse,
  getCoursesByDateRange,
  getNewCourses,
  getCoursesWithStatus
} from "../controllers/coursesController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireCreator } from "../middleware/roleMiddleware.js"
import express from "express"

const router = express.Router();

router.get("/my-created", authMiddleware, requireCreator, getMyCreatedCourses)

router.get("/my", authMiddleware, getMyMemberCourses)

router.get("/upcoming", getUpcomingCourses)

router.get("/week", getWeekCourses)

router.get("/date-range", getCoursesByDateRange)

router.get("/new", getNewCourses)

router.get("/with-status", authMiddleware, getCoursesWithStatus)

router.get("/", showAllCourses)

router.post("/", authMiddleware, requireCreator, createNewCourse);

router.delete("/:id", authMiddleware, requireCreator, deleteCourse);

router.put("/:id", authMiddleware, requireCreator, updateCourse);

router.get("/:id", showCourse)

export default router