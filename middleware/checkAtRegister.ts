import { defineNuxtRouteMiddleware, navigateTo, useUser } from '#imports'

export default defineNuxtRouteMiddleware(async () => {
  const { loginedUser, checkAuthState } = useUser()
  await checkAuthState()
  if (loginedUser.value === null) {
    return navigateTo('/login')
  } else if (loginedUser.value.name !== '') {
    return navigateTo('/rooms')
  }
})
