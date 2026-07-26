export default defineNuxtConfig({
  compatibilityDate: "2024-08-01",
  devtools: { enabled: true },
  modules: ["@pinia/nuxt"],
  css: ["ant-design-vue/dist/reset.css"],
  build: {
    transpile: ["ant-design-vue"],
  },
  vite: {
    optimizeDeps: {
      include: [
        "dayjs",
        "dayjs/plugin/customParseFormat",
        "dayjs/plugin/weekday",
        "dayjs/plugin/localeData",
        "dayjs/plugin/weekOfYear",
        "dayjs/plugin/weekYear",
        "dayjs/plugin/advancedFormat",
        "dayjs/plugin/quarterOfYear",
      ],
    },
  },
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:4000/api",
      socketUrl: process.env.NUXT_PUBLIC_SOCKET_URL || "http://localhost:4000",
    },
  },
  typescript: {
    strict: true,
  },
});
