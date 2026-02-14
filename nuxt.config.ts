// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxtjs/google-fonts'
  ],

  googleFonts: {
    families: {
      Lobster: true
    },
    display: 'swap'
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  runtimeConfig: {
    rmvApiKey: process.env.RMV_API_KEY ?? process.env.VITE_API_KEY,
    public: {}
  },

  nitro: {
    minify: false,
    externals: {
      inline: ['axios']
    },
    prerender: {
      crawlLinks: false,
      routes: ['/']
    }
  }
})
