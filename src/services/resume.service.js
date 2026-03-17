import path from "path";
import prisma from "../lib/prisma.js";
import { parseResumeFile } from "./parser.service.js";
import {
  calculateAtsScore,
  classifyResumeDomain,
  rankAgainstJobDescription,
} from "./ml.service.js";

export async function processResume(req) {
  const file = req.file;
  const absolutePath = path.resolve(file.path);

  const parsedResume = await parseResumeFile(absolutePath);
  const resumeText = parsedResume.raw_text || "";

  const classification = classifyResumeDomain(resumeText);
  const jobDescription = req.body?.job_description || "";
  const similarityScore = rankAgainstJobDescription(resumeText, jobDescription);

  const atsScore = calculateAtsScore({
    domainConfidence: classification.confidence,
    jdSimilarity: similarityScore,
    skillsCount: parsedResume.skills_found?.length || 0,
    experienceYears: parsedResume.experience,
  });

  const resume = await prisma.resume.create({
    data: {
      filename: file.filename,
      skills: parsedResume.skills_found || [],
      experience: Math.round(Number(parsedResume.experience || 0)),
      atsScore,
      uploadedBy: {
        connect: {
          id: req.user.id,
        },
      },
    },
  });

  return {
    resume_id: resume.id,
    ats_score: atsScore,
    predicted_domain: classification.predictedDomain,
    domain_confidence: classification.confidence,
    domain_probabilities: classification.probabilities,
    job_similarity_score: similarityScore,
    extracted_profile: {
      name: parsedResume.name,
      email: parsedResume.email,
      skills_found: parsedResume.skills_found,
      experience: parsedResume.experience,
      degree: parsedResume.degree,
    },
  };
}
