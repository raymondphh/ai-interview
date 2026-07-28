import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middleware/auth";
import { extractTextFromDocument } from "../services/documentParser.service";
import { fetchTextFromUrl } from "../services/jdFetcher.service";
import { analyzeJD } from "../services/ai.service";

/** Upload file JD (PDF/DOCX), trích xuất text và lưu DB */
export async function uploadJD(req: AuthRequest, res: Response) {
  if (!req.file)
    return res.status(400).json({ message: "Vui lòng chọn file JD" });

  const rawText = await extractTextFromDocument(req.file.path);
  if (!rawText) {
    return res.status(400).json({
      message:
        "Không trích xuất được nội dung từ file. Hãy thử PDF hoặc DOCX.",
    });
  }

  const jd = await prisma.jobDescription.create({
    data: {
      userId: req.user!.userId,
      sourceType: "file",
      fileName: req.file.originalname,
      filePath: req.file.path,
      rawText,
    },
  });

  return res.status(201).json(jd);
}

/** Import JD từ link (Google Docs hoặc URL text) */
export async function uploadJDFromUrl(req: AuthRequest, res: Response) {
  const { url } = req.body as { url?: string };
  if (!url?.trim())
    return res.status(400).json({ message: "Vui lòng nhập link JD" });

  let rawText: string;
  try {
    rawText = await fetchTextFromUrl(url);
  } catch (err: any) {
    return res.status(400).json({ message: err.message || "Không tải được link" });
  }

  const jd = await prisma.jobDescription.create({
    data: {
      userId: req.user!.userId,
      sourceType: "url",
      fileName: "JD từ link",
      sourceUrl: url.trim(),
      rawText,
    },
  });

  return res.status(201).json(jd);
}

/** Gọi AI phân tích JD: giới thiệu cty, sản phẩm, yêu cầu tuyển dụng */
export async function analyzeJDController(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const jd = await prisma.jobDescription.findFirst({
    where: { id, userId: req.user!.userId },
  });
  if (!jd) return res.status(404).json({ message: "Không tìm thấy JD" });
  if (!jd.rawText)
    return res.status(400).json({ message: "JD chưa có nội dung để phân tích" });

  try {
    const analysis = await analyzeJD(jd.rawText);
    const updated = await prisma.jobDescription.update({
      where: { id },
      data: { analysis: analysis as any },
    });
    return res.json(updated);
  } catch (err: any) {
    console.error("Lỗi phân tích JD:", err.message || err);
    return res.status(500).json({
      message:
        "AI phân tích JD thất bại. Vui lòng kiểm tra GROQ_API_KEY và thử lại.",
    });
  }
}

export async function listJDs(req: AuthRequest, res: Response) {
  const jds = await prisma.jobDescription.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: "desc" },
  });
  return res.json(jds);
}

export async function getJD(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const jd = await prisma.jobDescription.findFirst({
    where: { id, userId: req.user!.userId },
  });
  if (!jd) return res.status(404).json({ message: "Không tìm thấy JD" });
  return res.json(jd);
}
