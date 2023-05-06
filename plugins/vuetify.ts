import { defineNuxtPlugin } from '#app'
import { createVuetify, ThemeDefinition } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import colors from 'vuetify/lib/util/colors.mjs'
import 'vuetify/styles'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'

const customTheme: ThemeDefinition = {
  dark: false,
  colors: {
    primary: colors.blue.base,
    accent: colors.grey.darken3,
    secondary: colors.amber.darken3,
    info: colors.teal.lighten1,
    warning: colors.amber.base,
    error: colors.deepOrange.accent4,
    success: colors.green.accent3,
  },
}

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: 'customTheme',
      themes: {
        customTheme,
      },
    },
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: {
        mdi,
      },
    },
  })

  nuxtApp.vueApp.use(vuetify)
})
