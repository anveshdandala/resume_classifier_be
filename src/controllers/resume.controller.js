import { processResume } from "../services/resume.service.js";
import { authenticate } from "../middlewares/auth.js";
export async function uploadResume(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Resume file required" });
    }
    const user = await authenticate(req);
    const result = await processResume(req);
    res.status(201).json({resume});
  } catch (err) {
    next(err);
  }
}
