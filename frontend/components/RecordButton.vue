<template>
  <div class="record-wrap">
    <a-button
      :type="recording ? 'default' : 'primary'"
      :danger="recording"
      shape="circle"
      size="large"
      class="record-btn"
      :disabled="disabled"
      @click="toggleRecording">
      <template #icon>
        <AudioMutedOutlined v-if="recording" />
        <AudioOutlined v-else />
      </template>
    </a-button>
    <div class="record-label">
      <a-tag v-if="recording" color="red">● Đang ghi âm...</a-tag>
      <span v-else class="hint">Bấm để ghi âm câu trả lời</span>
    </div>
    <audio v-if="audioUrl" :src="audioUrl" controls class="mt-8" />
  </div>
</template>

<script setup lang="ts">
import { AudioOutlined, AudioMutedOutlined } from "@ant-design/icons-vue";

defineProps<{ disabled?: boolean }>();
const emit = defineEmits<{ (e: "recorded", blob: Blob): void }>();

const recording = ref(false);
const audioUrl = ref<string | null>(null);
let mediaRecorder: MediaRecorder | null = null;
let chunks: BlobPart[] = [];

async function toggleRecording() {
  if (!recording.value) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunks = [];
    mediaRecorder = new MediaRecorder(stream);
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      audioUrl.value = URL.createObjectURL(blob);
      emit("recorded", blob);
      stream.getTracks().forEach((t) => t.stop());
    };
    mediaRecorder.start();
    recording.value = true;
  } else {
    mediaRecorder?.stop();
    recording.value = false;
  }
}
</script>

<style scoped>
.record-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.record-btn {
  width: 56px;
  height: 56px;
  font-size: 20px;
}
.hint {
  color: rgba(0, 0, 0, 0.45);
  font-size: 13px;
}
.mt-8 {
  margin-top: 8px;
}
</style>
