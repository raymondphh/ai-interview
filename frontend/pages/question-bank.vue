<template>
  <div class="page-wrap">
    <a-card :bordered="false" class="filter-card">
      <a-row :gutter="16">
        <a-col :xs="24" :md="12">
          <label class="filter-label">Ngành nghề</label>
          <a-select
            v-model:value="selectedIndustry"
            show-search
            placeholder="Chọn ngành nghề"
            style="width: 100%"
            :options="industryOptions"
            :filter-option="filterOption"
            @change="handleFilterChange" />
        </a-col>
        <a-col :xs="24" :md="12">
          <label class="filter-label">Cấp bậc</label>
          <a-select
            v-model:value="selectedLevel"
            placeholder="Chọn cấp bậc"
            style="width: 100%"
            :options="levelOptions"
            @change="handleFilterChange" />
        </a-col>
      </a-row>
    </a-card>

    <a-card
      v-if="selectedIndustry && selectedLevel"
      :bordered="false"
      class="section-card">
      <template #title>
        <span
          >📋 Câu hỏi: {{ selectedIndustry }} —
          <a-tag :color="levelColor(selectedLevel)">{{
            selectedLevel
          }}</a-tag></span
        >
      </template>

      <a-spin :spinning="loading">
        <a-empty
          v-if="!loading && questions.length === 0"
          description="Chưa có câu hỏi nào" />
        <a-list v-else :data-source="questions" :bordered="false">
          <template #renderItem="{ item, index }">
            <a-list-item>
              <a-tag class="q-index">{{ index + 1 }}</a-tag>
              <span class="q-text">{{ item.content }}</span>
            </a-list-item>
          </template>
        </a-list>
      </a-spin>
    </a-card>

    <a-empty
      v-else
      description="Chọn ngành nghề và cấp bậc để xem danh sách câu hỏi phỏng vấn"
      class="empty-select" />
  </div>
</template>

<script setup lang="ts">
import { questionBankService } from "~/services/questionBank.service";

interface QuestionBankItem {
  id: string;
  industry: string;
  level: string;
  content: string;
}

const industries = ref<string[]>([]);
const levels = ref<string[]>([]);
const selectedIndustry = ref<string | null>(null);
const selectedLevel = ref<string | null>(null);
const questions = ref<QuestionBankItem[]>([]);
const loading = ref(false);

const industryOptions = computed(() =>
  industries.value.map((i) => ({ label: i, value: i })),
);
const levelOptions = computed(() =>
  levels.value.map((l) => ({ label: l, value: l })),
);

function filterOption(input: string, option: any) {
  return option.label.toLowerCase().includes(input.toLowerCase());
}

function levelColor(level: string) {
  const map: Record<string, string> = {
    Intern: "default",
    Fresher: "blue",
    Junior: "cyan",
    Middle: "green",
    Senior: "orange",
    "Lead/Manager": "red",
  };
  return map[level] || "default";
}

async function handleFilterChange() {
  if (!selectedIndustry.value || !selectedLevel.value) return;
  loading.value = true;
  questions.value = [];
  try {
    const { data } = await questionBankService.getQuestions(
      selectedIndustry.value,
      selectedLevel.value,
    );
    questions.value = data;
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  const { data } = await questionBankService.getMeta();
  industries.value = data.industries;
  levels.value = data.levels;
});
</script>

<style scoped>
.page-wrap {
  max-width: 900px;
  margin: 0 auto;
}
.filter-card {
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.filter-label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.65);
}
.section-card {
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.q-index {
  margin-right: 8px;
}
.q-text {
  font-size: 14px;
}
.empty-select {
  margin-top: 60px;
}
</style>
