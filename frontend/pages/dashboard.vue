<template>
  <div class="page-wrap">
    <a-row :gutter="[16, 16]">
      <a-col :xs="12" :sm="12" :md="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic title="CV đã tải lên" :value="stats?.cvCount || 0">
            <template #prefix
              ><FileTextOutlined style="color: #1677ff"
            /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="12" :md="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic
            title="Buổi phỏng vấn"
            :value="stats?.interviewCount || 0">
            <template #prefix
              ><AudioOutlined style="color: #722ed1"
            /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="12" :md="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic
            title="Đã hoàn tất"
            :value="stats?.completedInterviews || 0">
            <template #prefix
              ><CheckCircleOutlined style="color: #52c41a"
            /></template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="12" :md="6">
        <a-card :bordered="false" class="stat-card">
          <a-statistic
            title="Điểm trung bình"
            :value="stats?.avgScore || 0"
            suffix="/ 10">
            <template #prefix><StarOutlined style="color: #faad14" /></template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <a-card title="📈 Lịch sử điểm số" :bordered="false" class="section-card">
      <a-table
        :data-source="scoreRows"
        :columns="columns"
        :pagination="{ pageSize: 5 }"
        row-key="date">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'score'">
            <a-tag :color="scoreColor(record.score)"
              >{{ record.score }}/10</a-tag
            >
          </template>
        </template>
      </a-table>
    </a-card>

    <a-card :bordered="false" class="section-card cta-card">
      <a-empty
        v-if="!stats?.cvCount"
        description="Bạn chưa có CV nào, hãy bắt đầu ngay!" />
      <a-button type="primary" size="large" @click="navigateTo('/upload-cv')">
        <template #icon><PlusOutlined /></template>
        Bắt đầu buổi phỏng vấn mới
      </a-button>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import {
  FileTextOutlined,
  AudioOutlined,
  CheckCircleOutlined,
  StarOutlined,
  PlusOutlined,
} from "@ant-design/icons-vue";
import { dashboardService } from "~/services/dashboard.service";

const stats = ref<any>(null);

const columns = [
  { title: "Thời gian", dataIndex: "date", key: "date" },
  { title: "Điểm", dataIndex: "score", key: "score" },
];

const scoreRows = computed(
  () =>
    stats.value?.scoreHistory?.map((s: any) => ({
      date: new Date(s.date).toLocaleString("vi-VN"),
      score: s.score,
    })) || [],
);

function scoreColor(score: number) {
  if (score >= 8) return "green";
  if (score >= 5) return "orange";
  return "red";
}

onMounted(async () => {
  const { data } = await dashboardService.stats();
  stats.value = data;
});
</script>

<style scoped>
.page-wrap {
  max-width: 1000px;
  margin: 0 auto;
}
.stat-card {
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.section-card {
  border-radius: 12px;
  margin-top: 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
.cta-card {
  text-align: center;
  padding: 16px 0;
}
</style>
