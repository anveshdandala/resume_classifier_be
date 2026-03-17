import path from "path";
import { spawn } from "child_process";

const parserScriptPath = path.resolve("src/utils/resume_parser.py");

export function parseResumeFile(filePath) {
  return new Promise((resolve, reject) => {
    const parser = spawn("python3", [parserScriptPath, filePath]);

    let stdout = "";
    let stderr = "";

    parser.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    parser.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    parser.on("error", (error) => {
      reject(new Error(`Resume parser process error: ${error.message}`));
    });

    parser.on("close", (code) => {
      if (code !== 0) {
        return reject(new Error(`Resume parser failed with code ${code}: ${stderr || stdout}`));
      }

      const lines = stdout
        .trim()
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      const rawJson = lines[lines.length - 1];
      if (!rawJson) {
        return reject(new Error("Resume parser returned empty output"));
      }

      try {
        const parsed = JSON.parse(rawJson);
        if (parsed.error) {
          return reject(new Error(parsed.error));
        }
        resolve(parsed);
      } catch {
        reject(new Error(`Resume parser returned invalid JSON: ${rawJson}`));
      }
    });
  });
}
