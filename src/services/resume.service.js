import prisma from "../lib/prisma.js";
import { calculateScore } from "./scoring.service.js";

export async function processResume(req) {
  const file = req.file;
  const userId = req.user.id;

  const skills = ["JavaScript", "Node.js"];
  const experience = 2;
  const atsScore = calculateScore(skills, experience);

  const resume = await prisma.resume.create({
    data: {
      filename: file.filename,
      skills,
      experience,
      atsScore,
      uploadedBy: {
        connect: {
          id: req.user.id,
        },
      },
    },
  });

  return {
    ats_score: atsScore,
    skills_found: skills,
    experience,
    resume_id: resume.id,
  };
}
