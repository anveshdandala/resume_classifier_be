import { Router } from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { uploadResume } from "../controllers/resume.controller.js";
import { authenticate } from "../middlewares/auth.js";

const router = Router();

router.post("/upload", authenticate, upload.single("resume"), uploadResume);

export default router;
