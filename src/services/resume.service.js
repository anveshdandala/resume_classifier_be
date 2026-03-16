import prisma from "../lib/prisma.js";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import calculateATSscore from "./scoring.service.js";

export async function processResume(req) {
  return new Promise((resolve, reject) => {
    if (!req.file) {
      return reject(new Error("No file uploaded"));
    }

    const filePath = req.file.path;
    const userId = req.user.id;

    console.log("Processing resume:", filePath);

    const scriptPath = path.resolve("src/run_parser.py");
    const pyprocess = spawn("python", [scriptPath, filePath]);

    let dataString = "";
    let errorString = "";

    pyprocess.stdout.on("data", (data) => {
      dataString += data.toString();
    });

    pyprocess.stderr.on("data", (data) => {
      errorString += data.toString();
    });

    pyprocess.on("close", async (code) => {
      if (code !== 0) {
        console.log("PYTHON ERROR:");
        console.log(errorString);
        fs.unlink(filePath, () => {});
        return reject(new Error("Resume parsing failed"));
      }

      try {
        const outcomes = JSON.parse(dataString);
        const parsed_outcomes = Array.isArray(outcomes) ? outcomes[0] : outcomes;

        const atsScore = calculateATSscore(
          parsed_outcomes.skills_found || [],
          parsed_outcomes.experience || 0,
          parsed_outcomes.jdKeywords || [],
          parsed_outcomes.minExperienceReq || 0,
        );

        const resume = await prisma.resume.create({
          data: {
            filename: req.file.filename,
            skills: parsed_outcomes.skills_found || [],
            experience: parsed_outcomes.experience || 0,
            atsScore,
            uploadedBy: {
              connect: { id: userId },
            },
          },
        });

        fs.unlink(filePath, () => {});

        resolve({
          ...parsed_outcomes,
          ats_score: atsScore,
          resume_id: resume.id,
        });
      } catch (err) {
        fs.unlink(filePath, () => {});
        reject(err);
      }
    });
  });
}

export async function processResumes(req) {
  return new Promise((resolve, reject) => {
    if (!req.files || req.files.length === 0) {
      return reject(new Error("No files uploaded"));
    }

    const filePaths = req.files.map((file) => file.path);
    const userId = req.user.id;

    console.log("Processing resumes:", filePaths);

    const scriptPath = path.resolve("src/utils/resume_parser.py");
    const pyprocess = spawn("python", [scriptPath, ...filePaths]);

    let dataString = "";
    let errorString = "";

    pyprocess.stdout.on("data", (data) => {
      dataString += data.toString();
    });

    pyprocess.stderr.on("data", (data) => {
      errorString += data.toString();
    });

    pyprocess.on("close", async (code) => {
      if (code !== 0) {
        console.error("PYTHON ERROR:", errorString);
        filePaths.forEach((filePath) => fs.unlink(filePath, () => {}));
        return reject(new Error("Resume parsing failed"));
      }

      try {
        const parsed_outcomes = JSON.parse(dataString);
        console.log("Resumes parsed successfully");

        const resumeData = filePaths.map((filePath, index) => {
          const outcome = parsed_outcomes[index] || {
            error: "No data from parser",
            skills_found: [],
            experience: 0,
          };

          const atsScore = calculateATSscore(
            outcome.skills_found || [],
            outcome.experience || 0,
            outcome.jdKeywords || [],
            outcome.minExperienceReq || 0,
          );

          return {
            filename: req.files[index].filename,
            skills: outcome.skills_found || [],
            experience: outcome.experience || 0,
            atsScore,
            uploadedById: userId,
          };
        });

        const createResult = await prisma.resume.createMany({
          data: resumeData,
        });

        filePaths.forEach((filePath) => fs.unlink(filePath, () => {}));

        resolve({
          success: true,
          count: createResult.count,
          parsedData: parsed_outcomes,
        });
      } catch (err) {
        console.error("Prisma/Parsing Error:", err);
        filePaths.forEach((filePath) => fs.unlink(filePath, () => {}));
        reject(err);
      }
    });
  });
}

export async function myResumes(userId) {
  try {
    console.log("userId", userId);
    const resumes = await prisma.resume.findMany({
      where: {
        uploadedById: userId,
      },
    });

    return resumes;
  } catch (err) {
    throw err;
  }
}
