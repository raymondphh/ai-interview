<template>
  <div class="auth-page">
    <a-card class="auth-card" :bordered="false">
      <div class="auth-header">
        <div class="auth-logo">🎯</div>
        <h1>{{ isRegister ? "Tạo tài khoản" : "Đăng nhập" }}</h1>
        <p class="auth-sub">AI Interview Platform — luyện phỏng vấn cùng AI</p>
      </div>

      <a-form
        :model="form"
        layout="vertical"
        @finish="handleSubmit"
        @finishFailed="handleSubmitFailed">
        <a-form-item
          v-if="isRegister"
          label="Họ tên"
          name="name"
          :rules="[{ required: true, message: 'Vui lòng nhập họ tên' }]">
          <a-input
            v-model:value="form.name"
            size="large"
            placeholder="Nguyễn Văn A">
            <template #prefix><UserOutlined /></template>
          </a-input>
        </a-form-item>

        <a-form-item
          label="Email"
          name="email"
          :rules="[
            { required: true, message: 'Vui lòng nhập email' },
            { type: 'email', message: 'Email không hợp lệ' },
          ]">
          <a-input
            v-model:value="form.email"
            size="large"
            type="email"
            placeholder="email@example.com">
            <template #prefix><MailOutlined /></template>
          </a-input>
        </a-form-item>

        <a-form-item
          label="Mật khẩu"
          name="password"
          :rules="[
            { required: true, message: 'Vui lòng nhập mật khẩu' },
            { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
          ]">
          <a-input-password
            v-model:value="form.password"
            size="large"
            placeholder="••••••••">
            <template #prefix><LockOutlined /></template>
          </a-input-password>
        </a-form-item>

        <a-alert
          v-if="error"
          type="error"
          :message="error"
          show-icon
          class="auth-alert" />

        <a-button
          type="primary"
          html-type="submit"
          size="large"
          :loading="loading"
          block>
          {{ isRegister ? "Đăng ký" : "Đăng nhập" }}
        </a-button>
      </a-form>

      <a-divider />

      <div class="auth-switch">
        <a @click="isRegister = !isRegister">
          {{
            isRegister
              ? "Đã có tài khoản? Đăng nhập ngay"
              : "Chưa có tài khoản? Đăng ký"
          }}
        </a>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
} from "@ant-design/icons-vue";
import { useAuthStore } from "~/stores/auth";

definePageMeta({ layout: false });

const auth = useAuthStore();
const isRegister = ref(false);
const loading = ref(false);
const error = ref("");

const form = reactive({ name: "", email: "", password: "" });

async function handleSubmit() {
  loading.value = true;
  error.value = "";
  try {
    if (isRegister.value) {
      await auth.register(form.name, form.email, form.password);
    } else {
      await auth.login(form.email, form.password);
    }
    navigateTo("/dashboard");
  } catch (e: any) {
    error.value =
      e.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại";
  } finally {
    loading.value = false;
  }
}

function handleSubmitFailed(errorInfo: any) {
  console.log("Validate Failed:", errorInfo);
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e6f4ff 0%, #f0f5ff 100%);
  padding: 16px;
}
.auth-card {
  width: 100%;
  max-width: 420px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}
.auth-header {
  text-align: center;
  margin-bottom: 24px;
}
.auth-logo {
  font-size: 36px;
  margin-bottom: 8px;
}
.auth-sub {
  color: rgba(0, 0, 0, 0.45);
  font-size: 13px;
}
.auth-alert {
  margin-bottom: 16px;
}
.auth-switch {
  text-align: center;
}
</style>
