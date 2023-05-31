// NOTE: pluginsの登録順の都合により、このファイルの先頭に1.を設定
// 別pluginsで使用するためこのファイルを最初に登録する必要あり
// https://nuxt.com/docs/guide/directory-structure/plugins#plugin-registration-order

import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'
import 'firebase/storage'
import { FirebaseFirestore } from '@firebase/firestore-types'
import { FirebaseAuth } from '@firebase/auth-types'
import { FirebaseStorage } from '@firebase/storage-types'
import { defineNuxtPlugin } from '#app'
import config from '../firebaseConfig.json'

if (!firebase.apps.length) {
  firebase.initializeApp({ ...config })
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('firebase', firebase)
  nuxtApp.provide('firestore', firebase.firestore())
  nuxtApp.provide('fireAuth', firebase.auth())
  nuxtApp.provide('fireStorage', firebase.storage())
})

declare module '#app' {
  interface NuxtApp {
    $firebase: typeof firebase
    $firestore: FirebaseFirestore
    $fireAuth: FirebaseAuth
    $fireStorage: FirebaseStorage
  }
}
