import { defineStore } from "pinia";
import { cvService } from "~/services/cv.service";

export interface CVAnalysis {
  summary: string;
  candidateName: string;
  industry: string;
  suggestedRole: string;
  seniorityLevel: string;
  yearsOfExperience: number;
  technicalSkills: string[];
  softSkills: string[];
  domainKnowledge: string[];
  keyProjects: string[];
  strengths: string[];
  weaknesses: string[];
  educationSummary: string;
}

export interface CV {
  id: string;
  fileName: string;
  rawText?: string;
  analysis?: CVAnalysis | null;
  createdAt: string;
}

export const useCVStore = defineStore("cv", {
  state: () => ({
    cvs: [] as CV[],
    current: null as CV | null,
    loading: false,
  }),
  actions: {
    async fetchAll() {
      this.loading = true;
      try {
        const { data } = await cvService.list();
        this.cvs = data;
      } finally {
        this.loading = false;
      }
    },
    async upload(file: File) {
      const { data } = await cvService.upload(file);
      this.cvs.unshift(data);
      this.current = data;
      return data as CV;
    },
    async analyze(id: string) {
      const { data } = await cvService.analyze(id);
      this.current = data;
      const idx = this.cvs.findIndex((c) => c.id === id);
      if (idx !== -1) this.cvs[idx] = data;
      return data as CV;
    },
    /** Xóa CV đang được chọn/phân tích khỏi state hiện tại (không xóa trong DB) */
    reset() {
      this.current = null;
    },
  },
});
