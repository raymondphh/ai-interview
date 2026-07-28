<template>
  <div class="page-wrap">
    <a-steps :current="currentStep" class="mb-steps">
      <a-step title="Tải CV & JD" />
      <a-step title="AI phân tích" />
      <a-step title="Bắt đầu phỏng vấn" />
    </a-steps>

    <!-- Bước 1a: Upload CV -->
    <a-card
      v-if="!cvStore.current"
      title="📄 Tải lên CV"
      :bordered="false"
      class="section-card">
      <a-upload-dragger
        :key="cvUploaderKey"
        :before-upload="beforeUploadCV"
        :show-upload-list="false"
        :disabled="uploadingCV"
        accept=".pdf,.doc,.docx">
        <p class="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p class="ant-upload-text">Kéo thả hoặc bấm để chọn file CV</p>
        <p class="ant-upload-hint">
          Hỗ trợ định dạng PDF, DOC, DOCX (tối đa 10MB)
        </p>
      </a-upload-dragger>

      <div v-if="selectedCVFile" class="selected-file">
        <FileTextOutlined /> {{ selectedCVFile.name }}
      </div>

      <a-button
        class="mt-16"
        type="primary"
        size="large"
        :loading="uploadingCV"
        :disabled="!selectedCVFile"
        @click="handleUploadCV">
        <template #icon><UploadOutlined /></template>
        Tải lên CV
      </a-button>
    </a-card>

    <!-- Bước 1b: Upload JD (sau khi đã có CV) -->
    <a-card
      v-else-if="!jdStore.current"
      title="📋 Tải lên Job Description (JD)"
      :bordered="false"
      class="section-card">
      <div class="cv-file-badge">
        <FileTextOutlined /> CV: {{ cvStore.current.fileName }}
        <a-button type="link" size="small" @click="handleChangeCV">
          ↺ Đổi CV
        </a-button>
      </div>

      <a-tabs v-model:activeKey="jdInputMode">
        <a-tab-pane key="file" tab="Upload file">
          <a-upload-dragger
            :key="jdUploaderKey"
            :before-upload="beforeUploadJD"
            :show-upload-list="false"
            :disabled="uploadingJD"
            accept=".pdf,.doc,.docx">
            <p class="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p class="ant-upload-text">
              Kéo thả hoặc bấm để chọn file JD
            </p>
            <p class="ant-upload-hint">
              Hỗ trợ PDF, DOCX (tối đa 10MB)
            </p>
          </a-upload-dragger>

          <div v-if="selectedJDFile" class="selected-file">
            <FileTextOutlined /> {{ selectedJDFile.name }}
          </div>

          <a-button
            class="mt-16"
            type="primary"
            size="large"
            :loading="uploadingJD"
            :disabled="!selectedJDFile"
            @click="handleUploadJD">
            <template #icon><UploadOutlined /></template>
            Tải lên JD
          </a-button>
        </a-tab-pane>

        <a-tab-pane key="url" tab="Link Google Docs / URL">
          <a-input
            v-model:value="jdUrl"
            size="large"
            placeholder="https://docs.google.com/document/d/..."
            allow-clear>
            <template #prefix><LinkOutlined /></template>
          </a-input>
          <p class="url-hint">
            Dán link Google Docs (công khai) hoặc URL trang chứa nội dung JD
          </p>
          <a-button
            class="mt-16"
            type="primary"
            size="large"
            :loading="uploadingJD"
            :disabled="!jdUrl.trim()"
            @click="handleUploadJDUrl">
            <template #icon><LinkOutlined /></template>
            Lấy JD từ link
          </a-button>
        </a-tab-pane>
      </a-tabs>
    </a-card>

    <!-- Bước 2 & 3: Phân tích CV + JD -->
    <template v-else>
      <a-card
        title="🔍 Phân tích CV bằng AI"
        :bordered="false"
        class="section-card">
        <template #extra>
          <a-button type="link" :disabled="analyzingCV" @click="handleChangeCV">
            ↺ Tải CV khác
          </a-button>
        </template>

        <div class="cv-file-badge">
          <FileTextOutlined /> {{ cvStore.current.fileName }}
        </div>

        <div v-if="!cvStore.current.analysis" class="analyze-empty">
          <a-empty description="Chưa phân tích CV này">
            <a-button type="primary" :loading="analyzingCV" @click="handleAnalyzeCV">
              Phân tích CV
            </a-button>
          </a-empty>
        </div>

        <a-descriptions v-else bordered :column="1" size="middle">
          <a-descriptions-item label="Ứng viên">
            {{ cvStore.current.analysis.candidateName }}
          </a-descriptions-item>
          <a-descriptions-item label="Tóm tắt">
            {{ cvStore.current.analysis.summary }}
          </a-descriptions-item>
          <a-descriptions-item label="Ngành nghề">
            <a-tag color="purple">{{ cvStore.current.analysis.industry }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Vị trí đề xuất">
            <a-tag color="blue">{{ cvStore.current.analysis.suggestedRole }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Cấp bậc">
            <a-tag color="cyan">{{ cvStore.current.analysis.seniorityLevel }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Số năm kinh nghiệm">
            {{ cvStore.current.analysis.yearsOfExperience }} năm
          </a-descriptions-item>
          <a-descriptions-item label="Kỹ năng chuyên môn">
            <a-tag
              v-for="s in cvStore.current.analysis.technicalSkills"
              :key="s"
              color="blue">{{ s }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Kỹ năng mềm">
            <a-tag v-for="s in cvStore.current.analysis.softSkills" :key="s">{{ s }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Lĩnh vực đã làm việc">
            <a-tag
              v-for="s in cvStore.current.analysis.domainKnowledge"
              :key="s"
              color="geekblue">{{ s }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Dự án/thành tích nổi bật">
            <ul class="project-list">
              <li v-for="(p, idx) in cvStore.current.analysis.keyProjects" :key="idx">
                {{ p }}
              </li>
            </ul>
          </a-descriptions-item>
          <a-descriptions-item label="Điểm mạnh">
            <a-tag
              v-for="s in cvStore.current.analysis.strengths"
              :key="s"
              color="green">{{ s }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Cần cải thiện">
            <a-tag
              v-for="s in cvStore.current.analysis.weaknesses"
              :key="s"
              color="orange">{{ s }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Học vấn">
            {{ cvStore.current.analysis.educationSummary }}
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <a-card
        title="🏢 Phân tích JD & Giới thiệu công ty"
        :bordered="false"
        class="section-card">
        <template #extra>
          <a-button type="link" :disabled="analyzingJD" @click="handleChangeJD">
            ↺ Tải JD khác
          </a-button>
        </template>

        <div class="cv-file-badge">
          <FileTextOutlined />
          {{ jdStore.current.fileName || "JD từ link" }}
          <span v-if="jdStore.current.sourceUrl" class="jd-url">
            ({{ jdStore.current.sourceUrl }})
          </span>
        </div>

        <div v-if="!jdStore.current.analysis" class="analyze-empty">
          <a-empty description="Chưa phân tích JD này">
            <a-button type="primary" :loading="analyzingJD" @click="handleAnalyzeJD">
              Phân tích JD & công ty
            </a-button>
          </a-empty>
        </div>

        <template v-else>
          <a-alert
            type="info"
            show-icon
            class="company-alert"
            :message="jdStore.current.analysis.companyName"
            :description="jdStore.current.analysis.companyOverview" />

          <a-descriptions bordered :column="1" size="middle" class="mt-16">
            <a-descriptions-item label="Vị trí tuyển dụng">
              <a-tag color="blue">{{ jdStore.current.analysis.jobTitle }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="Mô tả vị trí">
              {{ jdStore.current.analysis.jobSummary }}
            </a-descriptions-item>
            <a-descriptions-item label="Ngành nghề công ty">
              <a-tag color="purple">{{ jdStore.current.analysis.industry }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="Cấp bậc yêu cầu">
              <a-tag color="cyan">{{ jdStore.current.analysis.seniorityLevel }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="Địa điểm">
              {{ jdStore.current.analysis.workLocation || "—" }}
            </a-descriptions-item>
            <a-descriptions-item label="Sản phẩm/dịch vụ công ty">
              <a-tag
                v-for="p in jdStore.current.analysis.companyProducts"
                :key="p"
                color="geekblue">{{ p }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="Sản phẩm key liên quan JD">
              <a-tag
                v-for="p in jdStore.current.analysis.keyProductsRelatedToJD"
                :key="p"
                color="gold">{{ p }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="Kỹ năng bắt buộc">
              <a-tag
                v-for="s in jdStore.current.analysis.requiredSkills"
                :key="s"
                color="red">{{ s }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="Kỹ năng ưu tiên">
              <a-tag
                v-for="s in jdStore.current.analysis.preferredSkills"
                :key="s"
                color="orange">{{ s }}</a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="Trách nhiệm công việc">
              <ul class="project-list">
                <li
                  v-for="(r, idx) in jdStore.current.analysis.responsibilities"
                  :key="idx">
                  {{ r }}
                </li>
              </ul>
            </a-descriptions-item>
            <a-descriptions-item label="Yêu cầu ứng viên">
              <ul class="project-list">
                <li
                  v-for="(r, idx) in jdStore.current.analysis.requirements"
                  :key="idx">
                  {{ r }}
                </li>
              </ul>
            </a-descriptions-item>
            <a-descriptions-item
              v-if="jdStore.current.analysis.benefits?.length"
              label="Quyền lợi">
              <a-tag
                v-for="b in jdStore.current.analysis.benefits"
                :key="b"
                color="green">{{ b }}</a-tag>
            </a-descriptions-item>
          </a-descriptions>
        </template>
      </a-card>

      <a-card v-if="canStartInterview" :bordered="false" class="section-card action-card">
        <a-button
          type="primary"
          size="large"
          block
          :loading="creatingInterview"
          @click="handleStartInterview">
          <template #icon><AudioOutlined /></template>
          Bắt đầu phỏng vấn thử (theo CV + JD)
        </a-button>
        <p class="action-hint">
          Câu hỏi sẽ được tạo dựa trên CV của bạn và yêu cầu JD/công ty tuyển dụng
        </p>
      </a-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { message } from "ant-design-vue";
import {
  InboxOutlined,
  FileTextOutlined,
  UploadOutlined,
  AudioOutlined,
  LinkOutlined,
} from "@ant-design/icons-vue";
import { useCVStore } from "~/stores/cv";
import { useJDStore } from "~/stores/jd";
import { useInterviewStore } from "~/stores/interview";

const cvStore = useCVStore();
const jdStore = useJDStore();
const interviewStore = useInterviewStore();

const selectedCVFile = ref<File | null>(null);
const selectedJDFile = ref<File | null>(null);
const jdUrl = ref("");
const jdInputMode = ref<"file" | "url">("file");

const uploadingCV = ref(false);
const uploadingJD = ref(false);
const analyzingCV = ref(false);
const analyzingJD = ref(false);
const creatingInterview = ref(false);

const cvUploaderKey = ref(0);
const jdUploaderKey = ref(0);

const currentStep = computed(() => {
  if (!cvStore.current || !jdStore.current) return 0;
  if (!cvStore.current.analysis || !jdStore.current.analysis) return 1;
  return 2;
});

const canStartInterview = computed(
  () => cvStore.current?.analysis && jdStore.current?.analysis,
);

onMounted(() => {
  cvStore.reset();
  jdStore.reset();
  interviewStore.reset();
  selectedCVFile.value = null;
  selectedJDFile.value = null;
  jdUrl.value = "";
});

function beforeUploadCV(file: File) {
  selectedCVFile.value = file;
  cvUploaderKey.value++;
  return false;
}

function beforeUploadJD(file: File) {
  selectedJDFile.value = file;
  jdUploaderKey.value++;
  return false;
}

async function handleUploadCV() {
  if (!selectedCVFile.value) return;
  uploadingCV.value = true;
  try {
    await cvStore.upload(selectedCVFile.value);
    message.success("Tải CV thành công! Tiếp theo hãy tải JD công ty.");
    selectedCVFile.value = null;
  } catch (e: any) {
    message.error(e.response?.data?.message || "Tải CV thất bại");
  } finally {
    uploadingCV.value = false;
  }
}

async function handleUploadJD() {
  if (!selectedJDFile.value) return;
  uploadingJD.value = true;
  try {
    await jdStore.upload(selectedJDFile.value);
    message.success("Tải JD thành công! Bạn có thể phân tích CV và JD.");
    selectedJDFile.value = null;
  } catch (e: any) {
    message.error(e.response?.data?.message || "Tải JD thất bại");
  } finally {
    uploadingJD.value = false;
  }
}

async function handleUploadJDUrl() {
  if (!jdUrl.value.trim()) return;
  uploadingJD.value = true;
  try {
    await jdStore.uploadFromUrl(jdUrl.value.trim());
    message.success("Lấy JD từ link thành công!");
    jdUrl.value = "";
  } catch (e: any) {
    message.error(e.response?.data?.message || "Không lấy được JD từ link");
  } finally {
    uploadingJD.value = false;
  }
}

async function handleAnalyzeCV() {
  if (!cvStore.current) return;
  analyzingCV.value = true;
  try {
    await cvStore.analyze(cvStore.current.id);
    message.success("Phân tích CV hoàn tất!");
  } catch (e: any) {
    message.error(e.response?.data?.message || "Phân tích CV thất bại");
  } finally {
    analyzingCV.value = false;
  }
}

async function handleAnalyzeJD() {
  if (!jdStore.current) return;
  analyzingJD.value = true;
  try {
    await jdStore.analyze(jdStore.current.id);
    message.success("Phân tích JD & giới thiệu công ty hoàn tất!");
  } catch (e: any) {
    message.error(e.response?.data?.message || "Phân tích JD thất bại");
  } finally {
    analyzingJD.value = false;
  }
}

async function handleStartInterview() {
  if (!cvStore.current || !jdStore.current) return;
  creatingInterview.value = true;
  try {
    const interview = await interviewStore.create(
      cvStore.current.id,
      10,
      jdStore.current.id,
    );
    navigateTo(`/interview/${interview.id}`);
  } catch (e: any) {
    message.error(e.response?.data?.message || "Không thể tạo buổi phỏng vấn");
  } finally {
    creatingInterview.value = false;
  }
}

function handleChangeCV() {
  cvStore.reset();
  jdStore.reset();
  if (typeof window !== "undefined") {
    window.location.reload();
  }
}

function handleChangeJD() {
  jdStore.reset();
  selectedJDFile.value = null;
  jdUrl.value = "";
  jdUploaderKey.value++;
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
.jd-url {
  font-weight: 400;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  word-break: break-all;
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
.url-hint {
  margin-top: 8px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 13px;
}
.company-alert {
  margin-bottom: 0;
}
.action-card {
  text-align: center;
}
.action-hint {
  margin-top: 12px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 13px;
}
</style>
