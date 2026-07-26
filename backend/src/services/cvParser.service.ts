import fs from 'fs';
import path from 'path';
// @ts-ignore - pdf-parse has no types
import pdfParse from 'pdf-parse';

/** Trích xuất text thô từ file CV (hiện hỗ trợ PDF; DOC/DOCX có thể bổ sung sau) */
export async function extractTextFromCV(filePath: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.pdf') {
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return data.text;
  }
  // TODO: bổ sung parser cho .doc/.docx (vd: dùng thư viện mammoth)
  return '';
}
