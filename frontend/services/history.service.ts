import { createApiClient } from "./api";

export const historyService = {
  list() {
    return createApiClient().get("/history");
  },
  getByCV(cvId: string) {
    return createApiClient().get(`/history/${cvId}`);
  },
};
