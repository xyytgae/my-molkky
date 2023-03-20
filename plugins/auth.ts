import { defineNuxtPlugin } from '#app'
import { useNuxtApp } from '#app'
import firebase from 'firebase/app'

export default defineNuxtPlugin(async (nuxtApp) => {
  const { $fireAuth } = useNuxtApp()
  const auth = () => {
    return new Promise((resolve) => {
      $fireAuth.onAuthStateChanged((user) => {
        resolve(user || null)
      })
    })
  }
  nuxtApp.provide('auth', auth())
})

declare module '#app' {
  interface NuxtApp {
    $auth: Promise<firebase.User>
  }
}
