<template>
  <div class="page-wrap">
    <a-spin :spinning="interviewStore.loading">
      <template v-if="interviewStore.current">
        <a-alert
          v-if="interviewStore.current.status !== 'completed'"
          message="Trả lời từng câu hỏi bên dưới bằng giọng nói hoặc văn bản. Kết quả sẽ cập nhật realtime ngay khi AI xử lý xong."
          type="info"
          show-icon
          class="mb-16" />

        <QuestionCard
          v-for="q in interviewStore.current.questions"
          :key="q.id"
          :question="q"
          :status="interviewStore.questionStatus[q.id]" />

        <a-button
          v-if="interviewStore.current.status !== 'completed'"
          type="primary"
          size="large"
          block
          @click="handleComplete">
          ✅ Hoàn tất phỏng vấn
        </a-button>

        <a-result
          v-else
          status="success"
          title="Bạn đã hoàn tất buổi phỏng vấn!">
          <template #extra>
            <a-button type="primary" size="large" @click="goToDashboard">
              Xem Dashboard
            </a-button>
          </template>
        </a-result>
      </template>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { useInterviewStore } from "~/stores/interview";
import { useCVStore } from "~/stores/cv";

const route = useRoute();
const interviewStore = useInterviewStore();
const cvStore = useCVStore();
const interviewId = route.params.id as string;

let socket: ReturnType<typeof useSocket> | null = null;

onMounted(async () => {
  await interviewStore.fetch(interviewId);

  socket = useSocket();
  socket.emit("join-interview", interviewId);

  socket.on(
    "answer:processing",
    ({ questionId, stage }: { questionId: string; stage: string }) => {
      interviewStore.setQuestionStatus(questionId, stage);
    },
  );

  socket.on("answer:scored", (question: any) => {
    interviewStore.patchQuestion(question);
  });
});

onBeforeUnmount(() => {
  if (socket) {
    socket.emit("leave-interview", interviewId);
    socket.off("answer:processing");
    socket.off("answer:scored");
  }
});

async function handleComplete() {
  await interviewStore.complete(interviewId);
}

/** Reset toàn bộ state CV/phỏng vấn hiện tại trước khi quay về Dashboard,
 * đảm bảo lần tới vào Upload CV sẽ bắt đầu sạch, không còn dữ liệu cũ. */
function goToDashboard() {
  interviewStore.reset();
  cvStore.reset();
  navigateTo("/dashboard");
}
</script>

<style scoped>
.page-wrap {
  max-width: 800px;
  margin: 0 auto;
}
.mb-16 {
  margin-bottom: 16px;
}
</style>
