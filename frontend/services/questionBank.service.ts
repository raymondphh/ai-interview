import { createApiClient } from "./api";

export const questionBankService = {
  getMeta() {
    return createApiClient().get("/question-bank/meta");
  },
  getQuestions(industry: string, level: string) {
    return createApiClient().get("/question-bank", {
      params: { industry, level },
    });
  },
};
