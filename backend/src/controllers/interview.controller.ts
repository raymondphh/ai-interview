import { Response } from "express";
import { prisma } from "../config/db";
import { AuthRequest } from "../middleware/auth";
import { generateQuestions, scoreAnswer } from "../services/ai.service";
import { transcribeAudio } from "../services/speech.service";
import { getIO } from "../socket";

/** Tạo 1 buổi phỏng vấn mới từ CV (+ JD nếu có): AI sinh câu hỏi dựa trên phân tích */
export async function createInterview(req: AuthRequest, res: Response) {
  const { cvId, jdId, questionCount } = req.body as {
    cvId: string;
    jdId?: string;
    questionCount?: number;
  };

  const cv = await prisma.cV.findFirst({
    where: { id: cvId, userId: req.user!.userId },
  });
  if (!cv) return res.status(404).json({ message: "Không tìm thấy CV" });
  if (!cv.analysis)
    return res.status(400).json({ message: "CV chưa được AI phân tích" });

  let jdAnalysis = null;
  if (jdId) {
    const jd = await prisma.jobDescription.findFirst({
      where: { id: jdId, userId: req.user!.userId },
    });
    if (!jd) return res.status(404).json({ message: "Không tìm thấy JD" });
    if (!jd.analysis)
      return res.status(400).json({ message: "JD chưa được AI phân tích" });
    jdAnalysis = jd.analysis as any;
  }

  const questions = await generateQuestions(
    cv.analysis as any,
    questionCount || 5,
    jdAnalysis,
  );

  const interview = await prisma.interview.create({
    data: {
      userId: req.user!.userId,
      cvId: cv.id,
      jdId: jdId || null,
      questions: {
        create: questions.map((q, idx) => ({ content: q, order: idx + 1 })),
      },
    },
    include: { questions: true },
  });

  return res.status(201).json(interview);
}

export async function getInterview(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const interview = await prisma.interview.findFirst({
    where: { id, userId: req.user!.userId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!interview)
    return res.status(404).json({ message: "Không tìm thấy buổi phỏng vấn" });
  return res.json(interview);
}

export async function listInterviews(req: AuthRequest, res: Response) {
  const interviews = await prisma.interview.findMany({
    where: { userId: req.user!.userId },
    include: { questions: true },
    orderBy: { createdAt: "desc" },
  });
  return res.json(interviews);
}

/** Nhận audio trả lời cho 1 câu hỏi -> Speech to Text -> AI chấm điểm.
 * Emit sự kiện realtime qua Socket.IO trong suốt quá trình xử lý. */
export async function submitAnswer(req: AuthRequest, res: Response) {
  const { questionId } = req.params;

  const question = await prisma.question.findFirst({
    where: { id: questionId },
    include: {
      interview: { include: { cv: true } },
    },
  });
  if (!question || question.interview.userId !== req.user!.userId) {
    return res.status(404).json({ message: "Không tìm thấy câu hỏi" });
  }

  const interviewId = question.interviewId;
  const io = getIO();

  let answerText = req.body.answerText as string | undefined;
  let audioPath: string | undefined;

  try {
    if (req.file) {
      audioPath = req.file.path;
      io.to(`interview:${interviewId}`).emit("answer:processing", {
        questionId,
        stage: "transcribing",
      });
      answerText = await transcribeAudio(req.file.path);
    }

    if (!answerText)
      return res
        .status(400)
        .json({ message: "Thiếu nội dung câu trả lời (text hoặc audio)" });

    io.to(`interview:${interviewId}`).emit("answer:processing", {
      questionId,
      stage: "scoring",
    });

    const analysis = question.interview.cv.analysis as any;
    const { score, feedback } = await scoreAnswer(
      question.content,
      answerText,
      {
        industry: analysis?.industry,
        suggestedRole: analysis?.suggestedRole,
        seniorityLevel: analysis?.seniorityLevel,
      },
    );

    const updated = await prisma.question.update({
      where: { id: questionId },
      data: { answerText, audioPath, score, feedback },
    });

    io.to(`interview:${interviewId}`).emit("answer:scored", updated);

    return res.json(updated);
  } catch (err: any) {
    console.error("Lỗi xử lý câu trả lời:", err.message || err);
    return res
      .status(500)
      .json({ message: "Xử lý câu trả lời thất bại, vui lòng thử lại." });
  }
}

/** Đánh dấu buổi phỏng vấn hoàn tất */
export async function completeInterview(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const interview = await prisma.interview.findFirst({
    where: { id, userId: req.user!.userId },
  });
  if (!interview)
    return res.status(404).json({ message: "Không tìm thấy buổi phỏng vấn" });

  const updated = await prisma.interview.update({
    where: { id },
    data: { status: "completed", completedAt: new Date() },
  });
  return res.json(updated);
}

/** Đệ quy ngược theo previousInterviewId để lấy hết câu hỏi đã hỏi ở TẤT CẢ các vòng trước đó */
async function getAllPreviousQuestions(
  interviewId: string,
  userId: string,
): Promise<string[]> {
  const all: string[] = [];
  let currentId: string | null = interviewId;

  while (currentId) {
    const interview: {
      previousInterviewId: string | null;
      questions: { content: string }[];
    } | null = await prisma.interview.findFirst({
      where: { id: currentId, userId },
      select: {
        previousInterviewId: true,
        questions: { select: { content: true } },
      },
    });
    if (!interview) break;
    all.push(...interview.questions.map((q) => q.content));
    currentId = interview.previousInterviewId;
  }

  return all;
}

/**
 * Phỏng vấn tiếp sau khi đã hoàn tất 1 lần: tạo 1 buổi phỏng vấn MỚI (round + 1),
 * dùng lại cùng CV/JD, nhưng AI được yêu cầu tránh hỏi lại các câu đã hỏi ở (các) vòng trước.
 */
export async function continueInterview(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { questionCount } = req.body as { questionCount?: number };

  const prevInterview = await prisma.interview.findFirst({
    where: { id, userId: req.user!.userId },
    include: { questions: true, cv: true, jd: true },
  });
  if (!prevInterview) {
    return res.status(404).json({ message: "Không tìm thấy buổi phỏng vấn" });
  }
  if (prevInterview.status !== "completed") {
    return res.status(400).json({
      message:
        "Chỉ có thể phỏng vấn tiếp sau khi đã hoàn tất buổi phỏng vấn hiện tại",
    });
  }
  if (!prevInterview.cv.analysis) {
    return res.status(400).json({ message: "CV chưa được AI phân tích" });
  }

  const askedQuestions = await getAllPreviousQuestions(id, req.user!.userId);
  const jdAnalysis = (prevInterview.jd?.analysis as any) || null;

  const questions = await generateQuestions(
    prevInterview.cv.analysis as any,
    questionCount || prevInterview.questions.length || 5,
    jdAnalysis,
    askedQuestions,
  );

  const newInterview = await prisma.interview.create({
    data: {
      userId: req.user!.userId,
      cvId: prevInterview.cvId,
      jdId: prevInterview.jdId,
      round: prevInterview.round + 1,
      previousInterviewId: prevInterview.id,
      questions: {
        create: questions.map((q, idx) => ({ content: q, order: idx + 1 })),
      },
    },
    include: { questions: true },
  });

  return res.status(201).json(newInterview);
}
