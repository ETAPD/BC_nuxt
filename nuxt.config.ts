// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: ["@pinia/nuxt"],

  components: [
    {
      path: "~/components",
      pathPrefix: false,
    },
  ],

  css: ["~/assets/css/base.css", "~/assets/css/main.css"],

  runtimeConfig: {
    public: {
      supabaseUrl: "https://hzqoxzfbaagsgcjkbpvb.supabase.co",
      supabaseKey: "sb_publishable_di5UHPBp08u8bf37tVDTbQ_cOxUoFBe",
    },
  },

  app: {
    head: {
      title: "TradeProjekt",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
      ],
      link: [{ rel: "icon", href: "/favicon.ico" }],
    },
  },
});
