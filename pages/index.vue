<script setup lang="ts">
import { useNuxtApp, useRouter } from '#app'
import { definePageMeta } from '#imports'

definePageMeta({
  middleware: ['check-auth'],
})

const router = useRouter()

const start = async () => {
  const auth = await useNuxtApp().$auth
  if (!auth) {
    router.push('/login')
  } else {
    router.push('/rooms')
  }
}
</script>

<template>
  <v-app>
    <UserHeader />
    <div class="class">
      <h1>Molkky</h1>
      <!-- <v-btn color="primary" @click="changeName"><span>名前変更</span></v-btn> -->
      <v-btn color="primary" @click="start"><span>START</span></v-btn>
    </div>
  </v-app>
</template>

<style scoped>
.class {
  margin: auto auto auto;
  text-align: center;
}
</style>
