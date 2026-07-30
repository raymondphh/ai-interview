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
            <a-space direction="vertical" style="width: 100%">
              <a-button
                type="primary"
                size="large"
                block
                :loading="continuing"
                @click="handleContinue">
                🔄 Phỏng vấn tiếp (câu hỏi mới)
              </a-button>
              <a-button size="large" block @click="goToDashboard">
                Xem Dashboard
              </a-button>
            </a-space>
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
const continuing = ref(false);

// route.params.id đổi khi bấm "Phỏng vấn tiếp" (chuyển sang buổi phỏng vấn mới, cùng component
// nên Vue KHÔNG tự remount) -> dùng ref theo dõi được để load lại + join đúng phòng socket.
const interviewId = computed(() => route.params.id as string);

let socket: ReturnType<typeof useSocket> | null = null;

async function loadInterview(id: string, previousId?: string) {
  if (socket && previousId) {
    socket.emit("leave-interview", previousId);
  }

  await interviewStore.fetch(id);

  if (!socket) {
    socket = useSocket();
    socket.on(
      "answer:processing",
      ({ questionId, stage }: { questionId: string; stage: string }) => {
        interviewStore.setQuestionStatus(questionId, stage);
      },
    );
    socket.on("answer:scored", (question: any) => {
      interviewStore.patchQuestion(question);
    });
  }
  socket.emit("join-interview", id);
}

onMounted(() => loadInterview(interviewId.value));

watch(interviewId, (newId, oldId) => {
  if (newId !== oldId) loadInterview(newId, oldId);
});

onBeforeUnmount(() => {
  if (socket) {
    socket.emit("leave-interview", interviewId.value);
    socket.off("answer:processing");
    socket.off("answer:scored");
  }
});

async function handleComplete() {
  await interviewStore.complete(interviewId.value);
}

/** Tạo buổi phỏng vấn mới (câu hỏi khác lần trước) rồi chuyển sang trang phỏng vấn đó */
async function handleContinue() {
  continuing.value = true;
  try {
    const nextInterview = await interviewStore.continueInterview(
      interviewId.value,
    );
    navigateTo(`/interview/${nextInterview.id}`);
  } finally {
    continuing.value = false;
  }
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
