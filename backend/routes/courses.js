import { createNewCourse, deleteCourse, showAllCourses, showCourse } from "../controllers/coursesController.js"
import express from "express"

const router = express.Router();

router.get("/", showAllCourses)

router.post("/", createNewCourse);

router.delete("/:id", deleteCourse);

router.get("/:id", showCourse)

export default router