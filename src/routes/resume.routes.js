import { Router } from "express";
import { upload } from "../middlewares/upload.middleware.js";
import { uploadResume } from "../controllers/resume.controller.js";

const router = Router();

router.post("/upload", upload.single("resume"), uploadResume);

export default router;
