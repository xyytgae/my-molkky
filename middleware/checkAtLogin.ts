import { defineNuxtRouteMiddleware, navigateTo, useUser } from '#imports'

export default defineNuxtRouteMiddleware(async () => {
  const { loginedUser, checkAuthState } = useUser()
  await checkAuthState()
  const isNotRegistered =
    loginedUser.value !== null &&
    loginedUser.value.id !== '' &&
    loginedUser.value.name === ''

  if (isNotRegistered) {
    return navigateTo('/register')
  } else if (loginedUser.value !== null) {
    return navigateTo('/mode')
  }
})
