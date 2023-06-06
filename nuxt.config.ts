import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  // Disable server-side rendering (https://go.nuxtjs.dev/ssr-mode)
  ssr: false,

  // Global page headers (https://go.nuxtjs.dev/config-head)
  app: {
    head: {
      titleTemplate: 'Molkky',
      title: 'my-molkky',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { hid: 'description', name: 'description', content: '' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    },
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: ['~/components', '~/fragments'],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: ['@pinia/nuxt'],

  // manifest: {
  //   name: 'Molkky',
  //   short_name: 'Molkky',
  //   description: 'モルックのスコアを記録します。',
  //   lang: 'ja',
  //   start_url: '/',
  //   display: 'fullscreen',
  //   background_color: '#387d39',
  // },

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {
    transpile: ['vuetify'],
  },
})
