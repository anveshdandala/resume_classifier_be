import prisma from "../lib/prisma.js";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import calculateATSscore from "./scoring.service.js";
import { addAbortListener } from "events";

export async function processResume(req) {
return new Promise((resolve, reject) => {
    if (!req.file) {
      return reject(new Error("No file uploaded"));
    }

    const filePath = req.file.path;
    console.log("sending file to model",filePath)
    const userId = req.user.id;

    console.log("Processing resume:", filePath);

    const scriptPath = path.resolve("src/utils/resume_parser.py");

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
        const parsed_outcomes = JSON.parse(dataString);
        console.log("Resume parsed successfully:", parsed_outcomes);

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

        

        // Deleting temporary file
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
export async function myResumes(userId){
  
    try{
      console.log("userId",userId);
      const resumes = await prisma.resume.findMany({
        where:{
          uploadedById:userId
        }
      })

      return resumes;
    }
    catch(err){
      throw err;
    }
  }


