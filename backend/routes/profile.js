import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  addProfilePhoto,
  deleteMyProfilePhoto,
  getMyProfilePhotos,
  upload,
} from "../controllers/profileController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/photos", upload.single("file"), addProfilePhoto);
router.get("/photos", getMyProfilePhotos);
router.delete("/photos/:id", deleteMyProfilePhoto);

export default router;
