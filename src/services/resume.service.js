import prisma from "../lib/prisma.js";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import {
  extractTextFromPDF,
  extractTextFromDocx,
} from "../utils/text_extractor.js";
export async function processResume(req) {
  if (!req.file) {
    throw new Error("No file uploaded");
  }

  const buffer = fs.readFileSync(req.file.path);
  const file_name = req.file.originalname;
  const mime = req.file.mimetype;
  const jobDescription = req.body.jobDescription;

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

  if (mime.includes("pdf")) {
    text = await extractTextFromPDF(buffer);
  } else if (mime.includes("word") || file_name.endsWith(".docx")) {
    text = await extractTextFromDocx(buffer);
  } else {
    fs.unlinkSync(req.file.path);
    throw new Error("Unsupported file type");
  }
  fs.unlinkSync(req.file.path);

  console.log("jobDescription", jobDescription);

  try {
    const res = await fetch(`http://localhost:8000/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Send both text and JD to Python
      body: JSON.stringify({ text: text, jobDescription: jobDescription }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`FastAPI error ${res.status}: ${errorBody}`);
    }

    console.log("status", res.status);

    // Use .json() directly instead of .text() + JSON.parse()
    const parsed = await res.json();
    console.log("RAW RESPONSE:", parsed);

    // Remember: FastAPI wraps your return dict inside a "data" property!
    const mlResult = parsed.data;

    const newResume = await prisma.resume.create({
      data: {
        filename: file_name,
        skills: mlResult.skills || [],
        matchedSkills: mlResult.matched_skills || [],
        experience: mlResult.experience || 0,
        atsScore: Math.round(mlResult.ats_score || 0),
        atsFeedback: mlResult.ats_feedback || [],
        role: mlResult.role || "UNKNOWN",
        uploadedById: req.user.id,
      },
    });

    const newJob = await prisma.job.create({
      data: {
        title: mlResult.role || "Unknown Role",
        description: jobDescription,
        createdById: req.user.id,
      },
    });

    const newMatch = await prisma.match.create({
      data: {
        resumeId: newResume.id,
        jobId: newJob.id,
        score: mlResult.match_score || 0,
        similarity: mlResult.match_score || 0,
      },
    });

    return {
      success: true,
      resume: newResume,
      job: newJob,
      match: newMatch,
    };
  } catch (err) {
    console.error("Processing Error:", err);
    throw err;
  }
}

export async function processResumes(req) {
  // 1. Handle both single file (req.file) and multiple files (req.files)
  const files = req.files || (req.file ? [req.file] : []);

  if (files.length === 0) {
    throw new Error("No files uploaded");
  }

  const jobDescription = req.body.jobDescription || "";
  const userId = req.user.id;

  try {
    // 2. Create ONE Job record for this batch of resumes
    let newJob = await prisma.job.create({
      data: {
        title: "Analyzing Batch...", // We will update this later based on ML results
        description: jobDescription,
        createdById: userId,
      },
    });

    // 3. Process all files concurrently using Promise.all
    const processPromises = files.map(async (file) => {
      const buffer = fs.readFileSync(file.path);
      const file_name = file.originalname;
      const mime = file.mimetype;

      let text = "";

      try {
        // Extract Text
        if (mime.includes("pdf")) {
          text = await extractTextFromPDF(buffer);
        } else if (mime.includes("word") || file_name.endsWith(".docx")) {
          text = await extractTextFromDocx(buffer);
        } else {
          throw new Error("Unsupported file type");
        }
      } finally {
        // Always clean up the file, even if extraction fails
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }

      // 4. Hit your FastAPI Backend
      const res = await fetch(`http://localhost:8000/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text, jobDescription: jobDescription }),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(
          `FastAPI error on ${file_name} - Status ${res.status}: ${errorBody}`,
        );
      }

      const parsed = await res.json();
      const mlResult = parsed.data;

      // 5. Save Resume to Database
      const newResume = await prisma.resume.create({
        data: {
          filename: file_name,
          skills: mlResult.skills || [],
          matchedSkills: mlResult.matched_skills || [],
          experience: mlResult.experience || 0,
          atsScore: Math.round(mlResult.ats_score || 0),
          atsFeedback: mlResult.ats_feedback || [],
          role: mlResult.role || "UNKNOWN",
          uploadedById: userId,
        },
      });

      // 6. Save Match Record connecting this Resume to the Job
      const newMatch = await prisma.match.create({
        data: {
          resumeId: newResume.id,
          jobId: newJob.id,
          score: mlResult.match_score || 0,
          similarity: mlResult.match_score || 0,
        },
      });

      return {
        resume: newResume,
        match: newMatch,
      };
    });

    // Wait for all resumes to finish processing
    const results = await Promise.all(processPromises);

    // 7. Optional: Update the Job title based on the first successful resume's role
    if (results.length > 0 && results[0].resume.role !== "UNKNOWN") {
      newJob = await prisma.job.update({
        where: { id: newJob.id },
        data: { title: results[0].resume.role },
      });
    }

    return {
      success: true,
      job: newJob,
      processedCount: results.length,
      results: results, // Array containing all created resumes and matches
    };
  } catch (err) {
    console.error("Bulk Processing Error:", err);
    // Safety fallback: Clean up any lingering files if the overall process crashed
    files.forEach((file) => {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
    });
    throw err;
  }
}

export async function myResumes(userId) {
  return await prisma.resume.findMany({
    where: { uploadedById: userId },
    orderBy: { createdAt: "desc" },
  });
}
