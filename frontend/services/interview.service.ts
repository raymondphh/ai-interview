import { createApiClient } from "./api";

export const interviewService = {
  list() {
    return createApiClient().get("/interviews");
  },
  get(id: string) {
    return createApiClient().get(`/interviews/${id}`);
  },
  create(cvId: string, questionCount = 10, jdId?: string) {
    return createApiClient().post("/interviews", { cvId, jdId, questionCount });
  },
  complete(id: string) {
    return createApiClient().post(`/interviews/${id}/complete`);
  },
  /** Tạo buổi phỏng vấn mới (round tiếp theo) với câu hỏi khác lần trước, dựa trên cùng CV/JD */
  continueInterview(id: string, questionCount?: number) {
    return createApiClient().post(`/interviews/${id}/continue`, {
      questionCount,
    });
  },
  submitAnswerText(questionId: string, answerText: string) {
    return createApiClient().post(
      `/interviews/questions/${questionId}/answer`,
      { answerText },
    );
  },
  submitAnswerAudio(questionId: string, audioBlob: Blob) {
    const form = new FormData();
    form.append("audio", audioBlob, "answer.webm");
    return createApiClient().post(
      `/interviews/questions/${questionId}/answer`,
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  },
};
