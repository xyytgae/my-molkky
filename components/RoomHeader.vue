<script setup lang="ts">
import { useRoute } from '#app'
import { storeToRefs } from 'pinia'
import { useHeaderStore } from '~/store/header'

const route = useRoute()
const { getRoom } = useHeaderStore()
const { getterRoomData } = storeToRefs(useHeaderStore())

/**
 * init
 */
const roomId = route.params.id
await getRoom({ roomId })
</script>

<template>
  <v-app-bar color="primary" class="px-4">
    <v-avatar v-if="getterRoomData" :image="getterRoomData.topImageUrl">
    </v-avatar>

    <v-app-bar-title v-if="getterRoomData" class="name">
      {{ getterRoomData.name }}
    </v-app-bar-title>
    <v-spacer></v-spacer>
    <slot />
    <!-- 
    <v-toolbar-items class="align-center">
      パスワード：
      <span v-if="getterRoomData.password">{{ getterRoomData.password }}</span>
      <span v-else>×</span>
    </v-toolbar-items> -->
  </v-app-bar>
</template>

<style scoped>
.name {
  padding-left: 20px;
}
</style>
