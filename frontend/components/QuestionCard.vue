<template>
  <a-card class="q-card" :bordered="false">
    <template #title>
      <a-tag color="blue">Câu {{ question.order }}</a-tag>
    </template>
    <template #extra>
      <a-tag v-if="question.score != null" :color="scoreColor">
        {{ question.score }}/10
      </a-tag>
      <a-tag v-else-if="status" color="processing">
        <LoadingOutlined spin /> {{ statusLabel }}
      </a-tag>
    </template>

    <p class="q-content">{{ question.content }}</p>

    <div v-if="question.score != null">
      <a-alert
        message="Nhận xét của AI"
        :description="question.feedback || ''"
        type="success"
        show-icon
        class="mb-12" />
      <a-typography-paragraph type="secondary">
        <strong>Câu trả lời của bạn:</strong> {{ question.answerText }}
      </a-typography-paragraph>
    </div>

    <div v-else>
      <RecordButton :disabled="!!status" @recorded="onRecorded" />
      <a-divider>hoặc trả lời bằng văn bản</a-divider>
      <a-textarea
        v-model:value="textAnswer"
        :rows="3"
        :disabled="!!status"
        placeholder="Nhập câu trả lời của bạn tại đây..." />
      <a-button
        class="mt-12"
        type="primary"
        :loading="submitting || !!status"
        :disabled="!textAnswer.trim()"
        block
        @click="submitText">
        Gửi câu trả lời
      </a-button>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import type { Question } from "~/stores/interview";
import { useInterviewStore } from "~/stores/interview";
import { message } from "ant-design-vue";
import { LoadingOutlined } from "@ant-design/icons-vue";

const props = defineProps<{
  question: Question;
  status?: string | null;
}>();
const interviewStore = useInterviewStore();
const textAnswer = ref("");
const submitting = ref(false);

const scoreColor = computed(() => {
  const s = props.question.score || 0;
  if (s >= 8) return "green";
  if (s >= 5) return "orange";
  return "red";
});

const statusLabel = computed(() => {
  if (props.status === "transcribing")
    return "Đang chuyển giọng nói thành văn bản...";
  if (props.status === "scoring") return "AI đang chấm điểm...";
  return "Đang xử lý...";
});

async function onRecorded(blob: Blob) {
  submitting.value = true;
  try {
    await interviewStore.submitAnswerAudio(props.question.id, blob);
    message.success("Đã chấm điểm câu trả lời!");
  } catch (e: any) {
    message.error(e.response?.data?.message || "Gửi câu trả lời thất bại");
  } finally {
    submitting.value = false;
  }
}

async function submitText() {
  if (!textAnswer.value.trim()) return;
  submitting.value = true;
  try {
    await interviewStore.submitAnswerText(
      props.question.id,
      textAnswer.value.trim(),
    );
    message.success("Đã chấm điểm câu trả lời!");
  } catch (e: any) {
    message.error(e.response?.data?.message || "Gửi câu trả lời thất bại");
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.q-card {
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.q-content {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 16px;
}
.mb-12 {
  margin-bottom: 12px;
}
.mt-12 {
  margin-top: 12px;
}
</style>
