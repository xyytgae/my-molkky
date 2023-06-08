<script setup lang="ts">
import { useRouter } from '#app'

const router = useRouter()
</script>

<template>
  <div>
    <v-main>
      <div class="class">
        <h1>Molkky</h1>
        <v-btn color="primary" @click="router.push('/rooms')"
          ><span>START</span></v-btn
        >
      </div>
    </v-main>
  </div>
</template>

<style scoped>
.class {
  margin: 240px 0px auto;
  text-align: center;
}
</style>
