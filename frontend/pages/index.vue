<template>
  <div />
</template>

<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

definePageMeta({ layout: false });

const auth = useAuthStore();

if (auth.token) {
  navigateTo("/dashboard");
} else {
  navigateTo("/login");
}
</script>
