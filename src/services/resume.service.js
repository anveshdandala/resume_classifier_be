import prisma from "../lib/prisma.js";
import fs from "fs";
import path from "path";
import {extractTextFromPDF, extractTextFromDocx} from "../utils/text_extractor.js";
export async function processResume(req) {
  if (!req.file) {
    throw new Error("No file uploaded");
  }

  const buffer = req.file.buffer;
  const file_name = req.file.originalname;
  const mime = req.file.mimetype;
  console.log(req.file);
  const jobDescription = req.body.jobDescription;
  console.log("jobDescription", jobDescription);
// {
//   fieldname: 'resume',
//   originalname: 'DurgaGanesh_Resume.docx',   
//   encoding: '7bit',
//   mimetype: '
// -officedocument.wordprocessingml.document',    
//   buffer: <Buffer 50 4b 03 04 14 00 06 00 08 00 00 00 21 00 54 d5 46 b6 99 01 00 00 0c 07 00 00 13 00 08 02 5b 43 6f 6e 74 65 6e 74 5f 54 79 70 65 73 5d 2e 78 6d 6c 20 ... 50398 more bytes>,
//   size: 50448
// } 

  let text = "";

  // choose extractor based on file type
  if (mime === "application/pdf") {
    text = await extractTextFromPDF(buffer);
  } else if (
    mime ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    text = await extractTextFromDocx(buffer);
  } else {
    throw new Error("Unsupported file type");
  }

  try {
    const res = await fetch(`http://localhost:8000/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    console.log("status",res.status);
    const data = await res.text();
    console.log("RAW RESPONSE:", data);
    
    const parsed = JSON.parse(data);
    return parsed;

  } catch (err) {
    throw err;
  }
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
