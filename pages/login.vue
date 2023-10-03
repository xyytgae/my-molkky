<script setup lang="ts">
import { useRouter } from '#app'
import { mdiAccount, mdiHome } from '@mdi/js'
import { definePageMeta, ref, useUser } from '#imports'

definePageMeta({
  middleware: ['check-at-login'],
})
const { googleLogin, guestLogin } = useUser()
const router = useRouter()

const isOpenedOverlay = ref<boolean>(false)
const isDrawerOpen = ref<boolean>(false)

const handleGuestLogin = async (email: string, password: string) => {
  isOpenedOverlay.value = true
  const { success } = await guestLogin(email, password)
  if (success) {
    isOpenedOverlay.value = false
    router.push('/mode')
  }
}

const handleGoogleLogin = async () => {
  const { success } = await googleLogin()
  if (success) {
    router.push('/mode')
  }
}
</script>

<template>
  <div>
    <v-navigation-drawer v-model="isDrawerOpen" app clipped>
      <v-list>
        <v-list-item to="/">
          <template #prepend>
            <v-icon :icon="mdiHome" color="black" />
          </template>
          <v-list-item-title class="text-subtitle-2 text-black"
            >ホーム</v-list-item-title
          >
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar flat app>
      <template #prepend>
        <v-app-bar-nav-icon @click="isDrawerOpen = !isDrawerOpen" />
      </template>
    </v-app-bar>

    <v-main>
      <v-container class="d-flex justify-center align-center py-12">
        <v-card class="mx-auto mt-5" elevation="0" width="350">
          <!-- <v-container> -->
          <v-card-title class="text-center my-3"> ログイン </v-card-title>

          <v-divider class="mx-7" />

          <v-card-actions class="py-10">
            <v-row class="mx-4">
              <v-col class="text-center">
                <v-btn
                  class="text-none"
                  block
                  variant="elevated"
                  size="large"
                  elevation="1"
                  @click="handleGoogleLogin"
                >
                  <img id="google-icon" src="/google.png" alt="Google" />
                  Googleでログイン</v-btn
                >
              </v-col>
              <v-col class="text-center">
                <v-btn
                  variant="elevated"
                  size="large"
                  block
                  elevation="1"
                  @click="handleGuestLogin('test1@example.com', '123456')"
                >
                  <v-icon :icon="mdiAccount" size="24" />
                  デモアカウント1でログイン</v-btn
                >
              </v-col>
              <v-col class="text-center">
                <v-btn
                  variant="elevated"
                  size="large"
                  block
                  elevation="1"
                  @click="handleGuestLogin('test2@example.com', '123456')"
                >
                  <v-icon :icon="mdiAccount" size="24" />
                  デモアカウント2でログイン</v-btn
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
      </v-container>
    </v-main>
  </div>
</template>

<style scoped>
.v-app-bar {
  border-bottom: 1px solid grey;
}
.v-main {
  background-color: rgb(var(--v-theme-warm-vanilla));
  height: 100vh;
}
#google-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}
</style>
