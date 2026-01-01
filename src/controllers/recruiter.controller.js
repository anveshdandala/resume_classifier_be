import prisma from "../lib/prisma.js";

export async function filterResumes(req, res, next) {
  try {
    const { skill, minScore } = req.query;

    const resumes = await prisma.resume.findMany({
      where: {
        atsScore: minScore ? { gte: Number(minScore) } : undefined,
        skills: skill ? { has: skill } : undefined,
      },
    });

    res.json(resumes);
  } catch (err) {
    next(err);
  }
}
