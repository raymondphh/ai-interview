import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middleware/auth";
import { extractTextFromDocument } from "../services/documentParser.service";
import { analyzeCV } from "../services/ai.service";

/** Upload CV, trích xuất text và lưu vào DB */
export async function uploadCV(req: AuthRequest, res: Response) {
  if (!req.file)
    return res.status(400).json({ message: "Vui lòng chọn file CV" });

  const rawText = await extractTextFromDocument(req.file.path);

  const cv = await prisma.cV.create({
    data: {
      userId: req.user!.userId,
      fileName: req.file.originalname,
      filePath: req.file.path,
      rawText,
    },
  });

  return res.status(201).json(cv);
}

/** Gọi AI để phân tích CV đã upload */
export async function analyzeCVController(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const cv = await prisma.cV.findFirst({
    where: { id, userId: req.user!.userId },
  });
  if (!cv) return res.status(404).json({ message: "Không tìm thấy CV" });
  if (!cv.rawText)
    return res
      .status(400)
      .json({ message: "CV chưa có nội dung để phân tích" });

  try {
    const analysis = await analyzeCV(cv.rawText);
    const updated = await prisma.cV.update({
      where: { id },
      data: { analysis: analysis as any },
    });
    return res.json(updated);
  } catch (err: any) {
    console.error("Lỗi phân tích CV:", err.message || err);
    return res.status(500).json({
      message:
        "AI phân tích CV thất bại. Vui lòng kiểm tra GROQ_API_KEY và thử lại.",
    });
  }
}

export async function listCVs(req: AuthRequest, res: Response) {
  const cvs = await prisma.cV.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: "desc" },
  });
  return res.json(cvs);
}

export async function getCV(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const cv = await prisma.cV.findFirst({
    where: { id, userId: req.user!.userId },
  });
  if (!cv) return res.status(404).json({ message: "Không tìm thấy CV" });
  return res.json(cv);
}
