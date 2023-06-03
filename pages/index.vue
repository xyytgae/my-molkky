<script setup lang="ts">
import { useRouter } from '#app'

const router = useRouter()
</script>

<template>
  <v-app>
    <UserHeader />
    <div class="class">
      <h1>Molkky</h1>
      <!-- <v-btn color="primary" @click="changeName"><span>名前変更</span></v-btn> -->
      <v-btn color="primary" @click="router.push('/rooms')"
        ><span>START</span></v-btn
      >
    </div>
  </v-app>
</template>

<style scoped>
.class {
  margin: auto auto auto;
  text-align: center;
}
</style>
