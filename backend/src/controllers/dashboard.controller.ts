import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';

/** Tổng hợp số liệu cho Dashboard: số CV, số buổi phỏng vấn, điểm trung bình, tiến độ theo thời gian */
export async function getDashboardStats(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  const [cvCount, interviewCount, questions] = await Promise.all([
    prisma.cV.count({ where: { userId } }),
    prisma.interview.count({ where: { userId } }),
    prisma.question.findMany({
      where: { interview: { userId }, score: { not: null } },
      select: { score: true, createdAt: true, interviewId: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const avgScore =
    questions.length > 0
      ? questions.reduce((sum, q) => sum + (q.score || 0), 0) / questions.length
      : 0;

  const completedInterviews = await prisma.interview.count({
    where: { userId, status: 'completed' },
  });

  return res.json({
    cvCount,
    interviewCount,
    completedInterviews,
    avgScore: Math.round(avgScore * 100) / 100,
    scoreHistory: questions.map((q) => ({ date: q.createdAt, score: q.score })),
  });
}
