<template>
  <div class="page-wrap">
    <a-steps :current="currentStep" class="mb-steps">
      <a-step title="Tải lên CV" />
      <a-step title="AI phân tích" />
      <a-step title="Bắt đầu phỏng vấn" />
    </a-steps>

    <!-- Chỉ hiện khu vực tải CV khi CHƯA có CV nào được chọn -->
    <a-card
      v-if="!cvStore.current"
      title="📄 Tải lên CV"
      :bordered="false"
      class="section-card">
      <a-upload-dragger
        :key="uploaderKey"
        :before-upload="beforeUpload"
        :show-upload-list="false"
        :disabled="uploading"
        accept=".pdf,.doc,.docx">
        <p class="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p class="ant-upload-text">Kéo thả hoặc bấm để chọn file CV</p>
        <p class="ant-upload-hint">
          Hỗ trợ định dạng PDF, DOC, DOCX (tối đa 10MB)
        </p>
      </a-upload-dragger>

      <div v-if="selectedFile" class="selected-file">
        <FileTextOutlined /> {{ selectedFile.name }}
      </div>

      <a-button
        class="mt-16"
        type="primary"
        size="large"
        :loading="uploading"
        :disabled="!selectedFile"
        @click="handleUpload">
        <template #icon><UploadOutlined /></template>
        Tải lên
      </a-button>
    </a-card>

    <!-- Sau khi có CV (đã tải lên), chỉ hiện khu vực phân tích -->
    <a-card
      v-else
      title="🔍 Phân tích CV bằng AI"
      :bordered="false"
      class="section-card">
      <template #extra>
        <a-button type="link" :disabled="analyzing" @click="handleChangeCV">
          ↺ Tải CV khác
        </a-button>
      </template>

      <div class="cv-file-badge">
        <FileTextOutlined /> {{ cvStore.current.fileName }}
      </div>

      <div v-if="!cvStore.current.analysis" class="analyze-empty">
        <a-empty description="Chưa phân tích CV này">
          <a-button type="primary" :loading="analyzing" @click="handleAnalyze">
            Phân tích ngay
          </a-button>
        </a-empty>
      </div>

      <div v-else>
        <a-descriptions bordered :column="1" size="middle">
          <a-descriptions-item label="Ứng viên">
            {{ cvStore.current.analysis.candidateName }}
          </a-descriptions-item>
          <a-descriptions-item label="Tóm tắt">
            {{ cvStore.current.analysis.summary }}
          </a-descriptions-item>
          <a-descriptions-item label="Ngành nghề">
            <a-tag color="purple">{{
              cvStore.current.analysis.industry
            }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Vị trí đề xuất">
            <a-tag color="blue">{{
              cvStore.current.analysis.suggestedRole
            }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Cấp bậc">
            <a-tag color="cyan">{{
              cvStore.current.analysis.seniorityLevel
            }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Số năm kinh nghiệm">
            {{ cvStore.current.analysis.yearsOfExperience }} năm
          </a-descriptions-item>
          <a-descriptions-item label="Kỹ năng chuyên môn">
            <a-tag
              v-for="s in cvStore.current.analysis.technicalSkills"
              :key="s"
              color="blue"
              >{{ s }}</a-tag
            >
          </a-descriptions-item>
          <a-descriptions-item label="Kỹ năng mềm">
            <a-tag v-for="s in cvStore.current.analysis.softSkills" :key="s">{{
              s
            }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Lĩnh vực đã làm việc">
            <a-tag
              v-for="s in cvStore.current.analysis.domainKnowledge"
              :key="s"
              color="geekblue"
              >{{ s }}</a-tag
            >
          </a-descriptions-item>
          <a-descriptions-item label="Dự án/thành tích nổi bật">
            <ul class="project-list">
              <li
                v-for="(p, idx) in cvStore.current.analysis.keyProjects"
                :key="idx">
                {{ p }}
              </li>
            </ul>
          </a-descriptions-item>
          <a-descriptions-item label="Điểm mạnh">
            <a-tag
              v-for="s in cvStore.current.analysis.strengths"
              :key="s"
              color="green"
              >{{ s }}</a-tag
            >
          </a-descriptions-item>
          <a-descriptions-item label="Cần cải thiện">
            <a-tag
              v-for="s in cvStore.current.analysis.weaknesses"
              :key="s"
              color="orange"
              >{{ s }}</a-tag
            >
          </a-descriptions-item>
          <a-descriptions-item label="Học vấn">
            {{ cvStore.current.analysis.educationSummary }}
          </a-descriptions-item>
        </a-descriptions>

        <a-button
          type="primary"
          size="large"
          class="mt-16"
          :loading="creatingInterview"
          @click="handleStartInterview">
          <template #icon><AudioOutlined /></template>
          Bắt đầu phỏng vấn thử
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { message } from "ant-design-vue";
import {
  InboxOutlined,
  FileTextOutlined,
  UploadOutlined,
  AudioOutlined,
} from "@ant-design/icons-vue";
import { useCVStore } from "~/stores/cv";
import { useInterviewStore } from "~/stores/interview";

const cvStore = useCVStore();
const interviewStore = useInterviewStore();

const selectedFile = ref<File | null>(null);
const uploading = ref(false);
const analyzing = ref(false);
const creatingInterview = ref(false);

const uploaderKey = ref(0);

const currentStep = computed(() => {
  if (!cvStore.current) return 0;
  if (!cvStore.current.analysis) return 1;
  return 2;
});

onMounted(() => {
  cvStore.reset();
  interviewStore.reset();
  selectedFile.value = null;
});

function beforeUpload(file: File) {
  selectedFile.value = file;
  uploaderKey.value++;
  return false;
}

async function handleUpload() {
  if (!selectedFile.value) return;
  uploading.value = true;
  try {
    await cvStore.upload(selectedFile.value);
    message.success("Tải CV thành công! Đang chuyển sang bước phân tích...");
    selectedFile.value = null;
  } catch (e: any) {
    message.error(e.response?.data?.message || "Tải CV thất bại");
  } finally {
    uploading.value = false;
  }
}

async function handleAnalyze() {
  if (!cvStore.current) return;
  analyzing.value = true;
  try {
    await cvStore.analyze(cvStore.current.id);
    message.success("Phân tích CV hoàn tất!");
  } catch (e: any) {
    message.error(e.response?.data?.message || "Phân tích thất bại");
  } finally {
    analyzing.value = false;
  }
}

async function handleStartInterview() {
  if (!cvStore.current) return;
  creatingInterview.value = true;
  try {
    const interview = await interviewStore.create(cvStore.current.id, 10);
    navigateTo(`/interview/${interview.id}`);
  } catch (e: any) {
    message.error(e.response?.data?.message || "Không thể tạo buổi phỏng vấn");
  } finally {
    creatingInterview.value = false;
  }
}

/** Quay lại bước tải CV, ẩn khu vực phân tích hiện tại */
function handleChangeCV() {
  cvStore.reset();
  selectedFile.value = null;
  uploaderKey.value++;
}
</script>

<style scoped>
.page-wrap {
  max-width: 800px;
  margin: 0 auto;
}
.mb-steps {
  margin-bottom: 24px;
}
.section-card {
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.selected-file {
  margin-top: 12px;
  color: #1677ff;
}
.cv-file-badge {
  margin-bottom: 16px;
  color: rgba(0, 0, 0, 0.65);
  font-weight: 500;
}
.mt-16 {
  margin-top: 16px;
}
.analyze-empty {
  padding: 24px 0;
}
.project-list {
  margin: 0;
  padding-left: 20px;
}
.project-list li {
  margin-bottom: 4px;
}
</style>
