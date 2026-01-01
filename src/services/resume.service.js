import prisma from "../lib/prisma.ts";
import { calculateScore } from "./scoring.service.js";

export async function processResume(file) {
  // mock parsing for now
  const skills = ["JavaScript", "Node.js"];
  const experience = 2;
  const atsScore = calculateScore(skills, experience);

  const resume = await prisma.resume.create({
    data: {
      filename: file.filename,
      skills,
      experience,
      atsScore,
    },
  });

  return {
    ats_score: atsScore,
    skills_found: skills,
    experience,
    resume_id: resume.id,
  };
}