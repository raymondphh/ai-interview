import fs from "fs";
import path from "path";
// @ts-ignore - pdf-parse has no types
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

/** Trích xuất text thô từ file PDF hoặc DOCX */
export async function extractTextFromDocument(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".pdf") {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text.trim();
  }
  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value.trim();
  }
  return "";
}

/** @deprecated dùng extractTextFromDocument */
export async function extractTextFromCV(filePath: string): Promise<string> {
  return extractTextFromDocument(filePath);
}
