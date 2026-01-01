import { processResume } from "../services/resume.service.js";

export async function uploadResume(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Resume file required" });
    }

    const result = await processResume(req.file);

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}
