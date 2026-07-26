import { Request, Response } from "express";
import { prisma } from "../config/db";
import {
  INDUSTRIES,
  LEVELS,
  generateQuestionsForIndustryLevel,
} from "../services/questionBank.service";

/** Trả về danh sách ngành nghề và cấp bậc cố định để hiển thị bộ lọc trên UI */
export async function getMeta(_req: Request, res: Response) {
  return res.json({ industries: INDUSTRIES, levels: LEVELS });
}

/** Lấy danh sách câu hỏi theo ngành nghề + cấp bậc.
 * Nếu chưa có trong DB (hoặc chưa đủ số lượng), gọi AI sinh thêm và lưu lại để dùng cho các lần sau. */
export async function getQuestions(req: Request, res: Response) {
  const { industry, level } = req.query as {
    industry?: string;
    level?: string;
  };

  if (!industry || !level) {
    return res
      .status(400)
      .json({ message: "Thiếu tham số industry hoặc level" });
  }
  if (!INDUSTRIES.includes(industry) || !LEVELS.includes(level)) {
    return res
      .status(400)
      .json({ message: "Ngành nghề hoặc cấp bậc không hợp lệ" });
  }

  const MIN_COUNT = 15;

  try {
    let items = await prisma.questionBankItem.findMany({
      where: { industry, level },
      orderBy: { createdAt: "asc" },
    });

    if (items.length < MIN_COUNT) {
      const needed = MIN_COUNT - items.length;
      const newQuestions = await generateQuestionsForIndustryLevel(
        industry,
        level,
        needed,
      );

      if (newQuestions.length > 0) {
        await prisma.questionBankItem.createMany({
          data: newQuestions.map((content) => ({ industry, level, content })),
        });
        items = await prisma.questionBankItem.findMany({
          where: { industry, level },
          orderBy: { createdAt: "asc" },
        });
      }
    }

    return res.json(items);
  } catch (err: any) {
    console.error("Lỗi lấy ngân hàng câu hỏi:", err.message || err);
    return res
      .status(500)
      .json({ message: "Không thể tải danh sách câu hỏi, vui lòng thử lại." });
  }
}
