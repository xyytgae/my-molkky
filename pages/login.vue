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
      <v-card-title class="text-center my-3"> ログイン </v-card-title>

      <v-divider class="mx-7"></v-divider>

      <v-card-actions>
        <v-row class="mx-6">
          <v-col class="text-center">
            <v-btn
              color="info"
              variant="elevated"
              size="large"
              block
              @click="login"
              >Googleでログイン</v-btn
            >
          </v-col>
          <v-col class="text-center">
            <v-btn
              color="primary"
              variant="elevated"
              size="large"
              block
              @click="guest('test1@example.com', '123456')"
              >デモアカウント1でログイン</v-btn
            >
          </v-col>
          <v-col class="text-center">
            <v-btn
              color="primary"
              variant="elevated"
              size="large"
              block
              @click="guest('test2@example.com', '123456')"
              >デモアカウント2でログイン</v-btn
            >
          </v-col>
        </v-row>
      </v-card-actions>
      <!-- </v-container> -->
    </v-card>

    <v-overlay
      :model-value="isOpenedOverlay"
      class="align-center justify-center"
    >
      <v-progress-circular color="primary" indeterminate size="128"
        >ログイン中...</v-progress-circular
      >
    </v-overlay>
  </v-app>
</template>
