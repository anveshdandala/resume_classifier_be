import { Router } from "express";
import { filterResumes } from "../controllers/recruiter.controller.js";

const router = Router();

router.get("/resumes", filterResumes);

export default router;
