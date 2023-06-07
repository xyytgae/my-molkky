<script setup lang="ts">
import { Room } from '../types/api'

interface Props {
  room: Room | null
}

withDefaults(defineProps<Props>(), {
  room: () => null,
})

/**
 * init
 */
</script>

<template>
  <v-app-bar color="primary" class="px-4">
    <v-app-bar-title v-if="room">
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

<style scoped></style>
