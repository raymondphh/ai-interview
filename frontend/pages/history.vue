<template>
  <div class="page-wrap">
    <a-spin :spinning="loading">
      <a-empty
        v-if="!loading && cvHistory.length === 0"
        description="Chưa có lịch sử nào. Hãy tải lên CV và bắt đầu phỏng vấn thử!">
        <a-button type="primary" @click="navigateTo('/upload-cv')"
          >Tải CV ngay</a-button
        >
      </a-empty>

      <a-collapse v-else v-model:activeKey="activeKeys" accordion>
        <a-collapse-panel v-for="cv in cvHistory" :key="cv.id">
          <template #header>
            <div class="cv-header">
              <FileTextOutlined />
              <span class="cv-name">{{ cv.fileName }}</span>
              <a-tag v-if="cv.analysis" color="blue">{{
                cv.analysis.suggestedRole
              }}</a-tag>
              <span class="cv-date">{{ formatDate(cv.createdAt) }}</span>
              <a-tag>{{ cv.interviews.length }} buổi phỏng vấn</a-tag>
            </div>
          </template>

          <a-descriptions
            v-if="cv.analysis"
            bordered
            :column="1"
            size="small"
            class="mb-16">
            <a-descriptions-item label="Tóm tắt">{{
              cv.analysis.summary
            }}</a-descriptions-item>
            <a-descriptions-item label="Kỹ năng">
              <a-tag v-for="s in cv.analysis.skills" :key="s" color="blue">{{
                s
              }}</a-tag>
            </a-descriptions-item>
          </a-descriptions>
          <a-alert
            v-else
            message="CV này chưa được AI phân tích"
            type="warning"
            show-icon
            class="mb-16" />

          <!-- CV chưa có buổi phỏng vấn nào -->
          <div v-if="cv.interviews.length === 0" class="empty-interview">
            <a-empty description="Chưa có buổi phỏng vấn nào cho CV này" />
            <a-button
              type="primary"
              size="large"
              :loading="creatingFor === cv.id"
              :disabled="!cv.analysis"
              @click="handleCreateInterview(cv)">
              <template #icon><AudioOutlined /></template>
              Tạo buổi phỏng vấn ngay
            </a-button>
            <p v-if="!cv.analysis" class="hint-text">
              CV này chưa được AI phân tích, vui lòng vào trang Upload CV để
              phân tích trước.
            </p>
          </div>

          <a-collapse v-else>
            <a-collapse-panel
              v-for="interview in cv.interviews"
              :key="interview.id">
              <template #header>
                <div class="interview-header">
                  <span>{{ formatDate(interview.createdAt) }}</span>
                  <a-tag
                    :color="
                      interview.status === 'completed' ? 'green' : 'orange'
                    ">
                    {{
                      interview.status === "completed"
                        ? "Đã hoàn tất"
                        : "Đang thực hiện"
                    }}
                  </a-tag>
                  <a-tag
                    v-if="avgScore(interview) !== null"
                    :color="scoreColor(avgScore(interview)!)">
                    Điểm TB: {{ avgScore(interview) }}/10
                  </a-tag>
                </div>
              </template>

              <div v-for="q in interview.questions" :key="q.id" class="q-item">
                <p class="q-title">
                  <a-tag color="blue">Câu {{ q.order }}</a-tag> {{ q.content }}
                </p>
                <div v-if="q.score != null">
                  <p class="q-answer">
                    <strong>Trả lời:</strong> {{ q.answerText }}
                  </p>
                  <a-alert
                    :message="`Điểm: ${q.score}/10`"
                    :description="q.feedback || ''"
                    type="success"
                    show-icon />
                </div>
                <a-tag v-else color="default">Chưa trả lời</a-tag>
                <a-divider />
              </div>

              <a-button
                v-if="interview.status !== 'completed'"
                type="link"
                @click="navigateTo(`/interview/${interview.id}`)">
                Tiếp tục buổi phỏng vấn này →
              </a-button>
            </a-collapse-panel>
          </a-collapse>

          <!-- Cho phép tạo thêm buổi phỏng vấn mới ngay cả khi đã có buổi trước đó -->
          <div v-if="cv.interviews.length > 0" class="add-more">
            <a-button
              type="dashed"
              block
              :loading="creatingFor === cv.id"
              :disabled="!cv.analysis"
              @click="handleCreateInterview(cv)">
              <template #icon><PlusOutlined /></template>
              Tạo thêm buổi phỏng vấn mới
            </a-button>
          </div>
        </a-collapse-panel>
      </a-collapse>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import {
  FileTextOutlined,
  AudioOutlined,
  PlusOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { historyService } from "~/services/history.service";
import { useInterviewStore } from "~/stores/interview";

interface QuestionHistory {
  id: string;
  content: string;
  order: number;
  answerText?: string | null;
  score?: number | null;
  feedback?: string | null;
}

interface InterviewHistory {
  id: string;
  status: string;
  createdAt: string;
  questions: QuestionHistory[];
}

interface CVHistory {
  id: string;
  fileName: string;
  createdAt: string;
  analysis?: {
    summary: string;
    skills: string[];
    suggestedRole: string;
  } | null;
  interviews: InterviewHistory[];
}

const cvHistory = ref<CVHistory[]>([]);
const loading = ref(false);
const activeKeys = ref<string[]>([]);
const creatingFor = ref<string | null>(null);
const interviewStore = useInterviewStore();

function formatDate(date: string) {
  return new Date(date).toLocaleString("vi-VN");
}

function avgScore(interview: InterviewHistory): number | null {
  const scored = interview.questions.filter((q) => q.score != null);
  if (scored.length === 0) return null;
  const sum = scored.reduce((acc, q) => acc + (q.score || 0), 0);
  return Math.round((sum / scored.length) * 100) / 100;
}

function scoreColor(score: number) {
  if (score >= 8) return "green";
  if (score >= 5) return "orange";
  return "red";
}

async function loadHistory() {
  loading.value = true;
  try {
    const { data } = await historyService.list();
    cvHistory.value = data;
  } finally {
    loading.value = false;
  }
}

async function handleCreateInterview(cv: CVHistory) {
  if (!cv.analysis) return;
  creatingFor.value = cv.id;
  try {
    const interview = await interviewStore.create(cv.id, 10);
    message.success("Đã tạo buổi phỏng vấn mới với 10 câu hỏi!");
    navigateTo(`/interview/${interview.id}`);
  } catch (e: any) {
    message.error(e.response?.data?.message || "Không thể tạo buổi phỏng vấn");
  } finally {
    creatingFor.value = null;
  }
}

onMounted(loadHistory);
</script>

<style scoped>
.page-wrap {
  max-width: 900px;
  margin: 0 auto;
}
.cv-header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.cv-name {
  font-weight: 600;
}
.cv-date {
  color: rgba(0, 0, 0, 0.45);
  font-size: 13px;
}
.interview-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.mb-16 {
  margin-bottom: 16px;
}
.q-item {
  margin-bottom: 8px;
}
.q-title {
  font-weight: 500;
  margin-bottom: 8px;
}
.q-answer {
  color: rgba(0, 0, 0, 0.65);
  margin-bottom: 8px;
}
.empty-interview {
  text-align: center;
  padding: 16px 0;
}
.empty-interview .ant-btn {
  margin-top: 8px;
}
.hint-text {
  color: rgba(0, 0, 0, 0.45);
  font-size: 13px;
  margin-top: 8px;
}
.add-more {
  margin-top: 16px;
}
</style>
