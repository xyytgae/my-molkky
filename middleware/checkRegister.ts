import { defineNuxtRouteMiddleware, navigateTo } from '#imports'
import { useNuxtApp } from '#app'

export default defineNuxtRouteMiddleware(async () => {
  const user = await useNuxtApp().$user
  if (!user) {
    navigateTo('/')
  }
})
