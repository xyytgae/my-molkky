<script setup lang="ts">
import { useRouter } from '#app'
import { definePageMeta, ref, useUser } from '#imports'

definePageMeta({
  middleware: ['check-at-login'],
})
const { googleLogin, guestLogin } = useUser()
const router = useRouter()

const isOpenedOverlay = ref(false)

const handleGuestLogin = async (email: string, password: string) => {
  isOpenedOverlay.value = true
  const { success } = await guestLogin(email, password)
  if (success) {
    isOpenedOverlay.value = false
    router.push('/rooms')
  }
}

const handleGoogleLogin = async () => {
  const { success } = await googleLogin()
  if (success) {
    router.push('/rooms')
  }
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
              @click="handleGoogleLogin"
              >Googleでログイン</v-btn
            >
          </v-col>
          <v-col class="text-center">
            <v-btn
              color="primary"
              variant="elevated"
              size="large"
              block
              @click="handleGuestLogin('test1@example.com', '123456')"
              >デモアカウント1でログイン</v-btn
            >
          </v-col>
          <v-col class="text-center">
            <v-btn
              color="primary"
              variant="elevated"
              size="large"
              block
              @click="handleGuestLogin('test2@example.com', '123456')"
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
