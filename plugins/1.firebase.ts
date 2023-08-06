// NOTE: pluginsの登録順の都合により、このファイルの先頭に1.を設定
// 別pluginsで使用するためこのファイルを最初に登録する必要あり
// https://nuxt.com/docs/guide/directory-structure/plugins#plugin-registration-order

import { initializeApp } from 'firebase/app'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getAuth, Auth } from 'firebase/auth'
import { getStorage, FirebaseStorage } from 'firebase/storage'
import { defineNuxtPlugin } from '#app'
import config from '../firebaseConfig.json'

const app = initializeApp({ ...config })

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('firestore', getFirestore(app))
  nuxtApp.provide('fireAuth', getAuth(app))
  nuxtApp.provide('fireStorage', getStorage(app))
})

declare module '#app' {
  interface NuxtApp {
    $firestore: Firestore
    $fireAuth: Auth
    $fireStorage: FirebaseStorage
  }
}
