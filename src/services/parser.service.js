import path from "path";
import { spawn } from "child_process";

const parserScriptPath = path.resolve("src/utils/resume_parser.py");
const PARSER_TIMEOUT_MS = 20000;

export function parseResumeFile(filePath) {
  return new Promise((resolve, reject) => {
    const parser = spawn("python3", [parserScriptPath, filePath]);

    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      parser.kill("SIGTERM");
      reject(new Error("Resume parser timed out"));
    }, PARSER_TIMEOUT_MS);

    parser.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    parser.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    parser.on("error", (error) => {
      clearTimeout(timeout);
      reject(new Error(`Resume parser process error: ${error.message}`));
    });

    parser.on("close", (code) => {
      clearTimeout(timeout);

      if (code !== 0) {
        return reject(new Error(`Resume parser failed with code ${code}: ${stderr || stdout}`));
      }

      const rawJson = stdout
        .trim()
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .at(-1);

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
