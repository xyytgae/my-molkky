import { defineNuxtRouteMiddleware, navigateTo } from '#imports'
import { useNuxtApp } from '#app'

export default defineNuxtRouteMiddleware(async () => {
  const user = await useNuxtApp().$auth
  if (!user) {
    navigateTo('/')
  }
})
