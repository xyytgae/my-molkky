<script setup lang="ts">
import { ref } from '#imports'

interface Emits {
  (e: 'closeDialog'): void
  (e: 'deleteRoom'): void
}

defineEmits<Emits>()

const dialog = ref<boolean>(true)
</script>

<template>
  <v-dialog v-model="dialog" max-width="300px">
    <v-card>
      <v-card-item>
        <v-card-title> ゲームを終了 </v-card-title>
      </v-card-item>
      <v-card-text> ルームを退出しますか？ </v-card-text>
      <v-card-actions>
        <v-btn variant="text" color="info" @click="$emit('closeDialog')"
          >キャンセル</v-btn
        >
        <v-spacer />
        <v-btn variant="text" color="info" @click="$emit('deleteRoom')"
          >OK</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
