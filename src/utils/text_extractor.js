import { createRequire } from "module";
const require = createRequire(import.meta.url);

const pdf = require("pdf-parse");
import mammoth from "mammoth";

export async function extractTextFromPDF(buffer) {
  const data = await pdf(buffer);
  return data.text;
}

export async function extractTextFromDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}