<script setup lang="ts">
import { definePageMeta, ref } from '#imports'
import { useMainStore } from '~/store/main'

definePageMeta({
  middleware: ['check-login'],
})

const store = useMainStore()
const { login, guestLogin } = store

const isOpenedOverlay = ref(false)

// TODO: 型修正
const guest = (email: any, password: any) => {
  isOpenedOverlay.value = true
  guestLogin({ email, password })
}
</script>

<template>
  <v-app>
    <v-card class="mx-auto mt-5" width="350">
      <!-- <v-container> -->
      <v-card-title>
        <h1 class="display-1 mx-auto">ログイン</h1>
      </v-card-title>

      <v-divider class="mx-7"></v-divider>

      <v-card-actions>
        <v-row>
          <v-col class="text-center">
            <v-btn color="info" x-large @click="login">Googleでログイン</v-btn>
          </v-col>
          <v-col class="text-center">
            <v-btn
              color="primary"
              large
              @click="guest('test1@example.com', '123456')"
              >デモアカウント1でログイン</v-btn
            >
          </v-col>
          <v-col class="text-center">
            <v-btn
              color="primary"
              large
              @click="guest('test2@example.com', '123456')"
              >デモアカウント2でログイン</v-btn
            >
          </v-col>
        </v-row>
      </v-card-actions>
      <!-- </v-container> -->
    </v-card>

    <v-overlay :value="isOpenedOverlay">
      <v-progress-circular indeterminate size="128"
        >ログイン中...</v-progress-circular
      >
    </v-overlay>
  </v-app>
</template>
