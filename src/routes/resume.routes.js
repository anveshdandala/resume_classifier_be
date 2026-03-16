import { Router } from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { uploadResume, getMyResumes, uploadResumesBatch } from "../controllers/resume.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.post("/upload", authenticate, upload.single("resume"), uploadResume);
router.get("/my",authenticate,getMyResumes);
router.post("/multi-upload",authenticate, upload.array("resumes",10), uploadResumesBatch);

export default router;
