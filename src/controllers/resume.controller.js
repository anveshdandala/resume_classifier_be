import { processResume, myResumes } from "../services/resume.service.js";
export async function uploadResume(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Resume file required" });
    }
    const result = await processResume(req);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getMyResumes(req, res, next) {
  try {
    const userId = req.user.id;
    const resumes = await myResumes(userId);
    const mapped = resumes.map(r => ({
    id: r.id,
    filename: r.filename,
    atsScore: r.atsScore,
    skills: r.skills,
    experience: r.experience,
    createdAt: r.createdAt,
    fileUrl: `http://localhost:5000/resumes/${r.filename}`
  }));
    res.status(200).json(mapped);
  } catch (err) {
    next(err);
  }
}
