<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider
      v-model:collapsed="collapsed"
      collapsible
      breakpoint="lg"
      theme="light"
      :width="220">
      <div class="logo">
        <span v-if="!collapsed">🎯 AI Interview</span>
        <span v-else>🎯</span>
      </div>
      <a-menu
        v-model:selectedKeys="selectedKeys"
        mode="inline"
        theme="light"
        :items="menuItems"
        @click="handleMenuClick" />
    </a-layout-sider>

    <a-layout>
      <a-layout-header
        style="background: #fff; padding: 0 24px"
        class="header-bar">
        <div class="header-inner">
          <div class="header-title">{{ pageTitle }}</div>
          <div v-if="auth.user" class="user-area">
            <a-avatar style="background-color: #1677ff">
              {{ auth.user.name?.charAt(0).toUpperCase() }}
            </a-avatar>
            <span class="user-name">{{ auth.user.name }}</span>
            <a-button danger @click="handleUserMenu({ key: 'logout' })">
              <LogoutOutlined /> Đăng xuất
            </a-button>
          </div>
        </div>
      </a-layout-header>

      <a-layout-content style="margin: 24px">
        <slot />
      </a-layout-content>

      <a-layout-footer style="text-align: center; color: #999">
        AI Interview Platform ©2026
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { h } from "vue";
import {
  DashboardOutlined,
  FileTextOutlined,
  HistoryOutlined,
  BookOutlined,
  LogoutOutlined,
} from "@ant-design/icons-vue";
import { useAuthStore } from "~/stores/auth";

const auth = useAuthStore();
const route = useRoute();
const collapsed = ref(false);

const menuItems = [
  {
    key: "/dashboard",
    icon: () => h(DashboardOutlined),
    label: "Dashboard",
  },
  {
    key: "/upload-cv",
    icon: () => h(FileTextOutlined),
    label: "Upload CV & JD",
  },
  {
    key: "/question-bank",
    icon: () => h(BookOutlined),
    label: "Ngân hàng câu hỏi",
  },
  {
    key: "/history",
    icon: () => h(HistoryOutlined),
    label: "Lịch sử",
  },
];

const selectedKeys = ref<string[]>([route.path]);
watch(
  () => route.path,
  (p) => (selectedKeys.value = [p]),
);

const pageTitle = computed(() => {
  if (route.path.startsWith("/dashboard")) return "Dashboard";
  if (route.path.startsWith("/upload-cv")) return "Upload CV & JD";
  if (route.path.startsWith("/interview")) return "Phỏng vấn thử";
  if (route.path.startsWith("/history")) return "Lịch sử";
  if (route.path.startsWith("/question-bank")) return "Ngân hàng câu hỏi";
  return "";
});

function handleMenuClick({ key }: { key: string }) {
  navigateTo(key);
}

function handleUserMenu({ key }: { key: string }) {
  if (key === "logout") {
    auth.logout();
    navigateTo("/login");
  }
}
</script>

<style scoped>
.logo {
  height: 48px;
  margin: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #1677ff;
  font-size: 16px;
}
.header-bar {
  border-bottom: 1px solid #f0f0f0;
}
.header-inner {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-title {
  font-size: 18px;
  font-weight: 600;
}
.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(0, 0, 0, 0.85);
}
.user-name {
  font-weight: 500;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(0, 0, 0, 0.85);
}
</style>
