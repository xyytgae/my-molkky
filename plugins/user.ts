import { defineNuxtPlugin, useNuxtApp } from '#app'
import { navigateTo } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  const { $auth, $firestore } = useNuxtApp()

  const user = async () => {
    const auth = await $auth
    if (!auth) {
      navigateTo('/login')
    }
    const usersSnapShot = await $firestore
      .collection('users')
      .doc(auth.uid)
      .get()

    const user = usersSnapShot.data()
    if (!user) return null

    return {
      uid: auth.uid,
      ...user,
    }
  }

  nuxtApp.provide('user', user())
})

// TODO: 正しくはfirebase.Userではないので修正する
declare module '#app' {
  interface NuxtApp {
    $user: Promise<firebase.User | null>
  }
}
