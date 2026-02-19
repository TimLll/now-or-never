// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      title: 'Now or Never!',
      meta: [
        { name: 'description', content: 'Run or Regret.' }
      ]
    }
  },

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
    '/': {
      prerender: true,
      headers: {
        'cache-control': 'public, max-age=0, must-revalidate'
      }
    }
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
