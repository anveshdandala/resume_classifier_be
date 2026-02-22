import { Router } from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { uploadResume, getMyResumes } from "../controllers/resume.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.post("/upload", authenticate, upload.single("resume"), uploadResume);
router.get("/my",authenticate,getMyResumes);

export default router;
