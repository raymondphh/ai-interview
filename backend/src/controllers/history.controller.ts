import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middleware/auth";

/** Lấy toàn bộ lịch sử: mỗi CV đã tải lên kèm các buổi phỏng vấn
 * (câu hỏi, câu trả lời, điểm số) đã thực hiện dựa trên CV đó. */
export async function getHistory(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  const cvs = await prisma.cV.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      interviews: {
        orderBy: { createdAt: "desc" },
        include: {
          questions: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  return res.json(cvs);
}

/** Lấy chi tiết lịch sử của 1 CV cụ thể */
export async function getHistoryByCV(req: AuthRequest, res: Response) {
  const { cvId } = req.params;
  const userId = req.user!.userId;

  const cv = await prisma.cV.findFirst({
    where: { id: cvId, userId },
    include: {
      interviews: {
        orderBy: { createdAt: "desc" },
        include: {
          questions: { orderBy: { order: "asc" } },
        },
      },
    },
  });

  if (!cv) return res.status(404).json({ message: "Không tìm thấy CV" });
  return res.json(cv);
}
