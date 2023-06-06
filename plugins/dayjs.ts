import dayjs from 'dayjs'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('dayjs', (date?: dayjs.ConfigType) => dayjs(date))
})

declare module '#app' {
  interface NuxtApp {
    $dayjs(date?: dayjs.ConfigType): dayjs.Dayjs
  }
}
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $dayjs(date?: dayjs.ConfigType): dayjs.Dayjs
  }
}
