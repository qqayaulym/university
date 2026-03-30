import { 
  showAllCourses, 
  createNewCourse, 
  updateCourse, 
  deleteCourse, 
  showCourse 
} from "../controllers/coursesController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { requireCreator } from "../middleware/roleMiddleware.js"
import express from "express"

const router = express.Router();

router.get("/", showAllCourses)

router.post("/", authMiddleware, requireCreator, createNewCourse);

router.delete("/:id", authMiddleware, requireCreator, deleteCourse);

router.put("/:id", authMiddleware, requireCreator, updateCourse);

router.get("/:id", showCourse)

export default router