import { defineStore } from "pinia";
import { interviewService } from "~/services/interview.service";

export interface Question {
  id: string;
  content: string;
  order: number;
  answerText?: string | null;
  score?: number | null;
  feedback?: string | null;
}

export interface Interview {
  id: string;
  status: string;
  questions: Question[];
}

export const useInterviewStore = defineStore("interview", {
  state: () => ({
    current: null as Interview | null,
    loading: false,
    questionStatus: {} as Record<string, string | null>,
  }),
  actions: {
    async create(cvId: string, questionCount = 10) {
      const { data } = await interviewService.create(cvId, questionCount);
      this.current = data;
      return data as Interview;
    },
    async fetch(id: string) {
      this.loading = true;
      try {
        const { data } = await interviewService.get(id);
        this.current = data;
        return data as Interview;
      } finally {
        this.loading = false;
      }
    },
    async submitAnswerAudio(questionId: string, blob: Blob) {
      const { data } = await interviewService.submitAnswerAudio(
        questionId,
        blob,
      );
      this.patchQuestion(data);
      return data;
    },
    async submitAnswerText(questionId: string, text: string) {
      const { data } = await interviewService.submitAnswerText(
        questionId,
        text,
      );
      this.patchQuestion(data);
      return data;
    },
    patchQuestion(question: Question) {
      if (!this.current) return;
      const idx = this.current.questions.findIndex((q) => q.id === question.id);
      if (idx !== -1) this.current.questions[idx] = question;
      this.questionStatus[question.id] = null;
    },
    setQuestionStatus(questionId: string, status: string | null) {
      this.questionStatus[questionId] = status;
    },
    async complete(id: string) {
      const { data } = await interviewService.complete(id);
      this.current = data;
      return data;
    },
    /** Xóa buổi phỏng vấn đang xem khỏi state hiện tại (không xóa trong DB) */
    reset() {
      this.current = null;
      this.questionStatus = {};
    },
  },
});
