import fs from "fs";
import path from "path";
// @ts-ignore - pdf-parse has no types
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
// pdf-to-img và tesseract.js chỉ publish dưới dạng ESM, còn project này build CommonJS
// -> không thể "import" tĩnh, phải dùng dynamic import() (trả về Promise, chạy được trong CJS)

/** Số ký tự tối thiểu để coi kết quả pdf-parse là "có text thật", dưới ngưỡng này sẽ fallback sang OCR */
const MIN_TEXT_LENGTH = 30;

/** OCR toàn bộ các trang của 1 file PDF dạng ảnh (scan/print-to-pdf) */
async function extractTextFromScannedPdf(filePath: string): Promise<string> {
  const { pdf: pdfToImg } = await import("pdf-to-img");
  const { createWorker } = await import("tesseract.js");

  const worker = await createWorker("eng+vie"); // nhận cả tiếng Anh lẫn tiếng Việt
  try {
    const document = await pdfToImg(filePath, { scale: 3 }); // scale cao hơn -> OCR chính xác hơn
    const pageTexts: string[] = [];

    for await (const pageImage of document) {
      const {
        data: { text },
      } = await worker.recognize(pageImage);
      pageTexts.push(text.trim());
    }

    return pageTexts.join("\n\n").trim();
  } finally {
    await worker.terminate();
  }
}

/** Trích xuất text thô từ file PDF hoặc DOCX */
export async function extractTextFromDocument(
  filePath: string,
): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".pdf") {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    const text = data.text.trim();

    // PDF không có lớp text thật (scan / "Print to PDF" từ ảnh, screenshot...)
    // -> pdf-parse trả về rỗng hoặc quá ngắn -> fallback sang OCR
    if (text.length < MIN_TEXT_LENGTH) {
      console.warn(
        `[documentParser] pdf-parse trả về ít text (${text.length} ký tự) cho file "${filePath}", chuyển sang OCR...`,
      );
      return await extractTextFromScannedPdf(filePath);
    }

    return text;
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
