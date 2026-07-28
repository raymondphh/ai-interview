import { defineStore } from "pinia";
import { jdService } from "~/services/jd.service";

export interface JDAnalysis {
  companyName: string;
  companyOverview: string;
  industry: string;
  companyProducts: string[];
  keyProductsRelatedToJD: string[];
  jobTitle: string;
  jobSummary: string;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  seniorityLevel: string;
  workLocation: string;
}

export interface JobDescription {
  id: string;
  sourceType: "file" | "url";
  fileName?: string | null;
  sourceUrl?: string | null;
  rawText?: string;
  analysis?: JDAnalysis | null;
  createdAt: string;
}

export const useJDStore = defineStore("jd", {
  state: () => ({
    jds: [] as JobDescription[],
    current: null as JobDescription | null,
    loading: false,
  }),
  actions: {
    async fetchAll() {
      this.loading = true;
      try {
        const { data } = await jdService.list();
        this.jds = data;
      } finally {
        this.loading = false;
      }
    },
    async upload(file: File) {
      const { data } = await jdService.upload(file);
      this.jds.unshift(data);
      this.current = data;
      return data as JobDescription;
    },
    async uploadFromUrl(url: string) {
      const { data } = await jdService.uploadFromUrl(url);
      this.jds.unshift(data);
      this.current = data;
      return data as JobDescription;
    },
    async analyze(id: string) {
      const { data } = await jdService.analyze(id);
      this.current = data;
      const idx = this.jds.findIndex((j) => j.id === id);
      if (idx !== -1) this.jds[idx] = data;
      return data as JobDescription;
    },
    reset() {
      this.current = null;
    },
  },
});
