<script setup lang="ts">
import { Room } from '../types/api'

interface Props {
  room: Room | null
}

const props = withDefaults(defineProps<Props>(), {
  room: () => null,
})

/**
 * init
 */
</script>

<template>
  <v-app-bar color="primary" class="px-4">
    <v-avatar v-if="room" :image="room.topImageUrl" />

    <v-app-bar-title v-if="room" class="name">
      {{ room.name }}
    </v-app-bar-title>
    <v-spacer />
    <slot />
    <!--
    <v-toolbar-items class="align-center">
      パスワード：
      <span v-if="room.password">{{ room.password }}</span>
      <span v-else>×</span>
    </v-toolbar-items> -->
  </v-app-bar>
</template>

<style scoped>
.name {
  padding-left: 20px;
}
</style>
