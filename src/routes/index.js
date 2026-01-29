import { Router } from "express";
import healthRoutes from "./health.routes.js";
import resumeRoutes from "./resume.routes.js";
import recruiterRoutes from "./recruiter.routes.js";
import authRoutes from "./auth.routes.js";

const router = Router();
router.use("/auth", authRoutes);
router.use("/health", healthRoutes);
router.use("/resume", resumeRoutes);
router.use("/recruiter", recruiterRoutes);

export default router;
