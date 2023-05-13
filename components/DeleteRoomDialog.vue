<script setup lang="ts">
import { ref } from '#imports'

const dialog = ref(true)
</script>

<template>
  <v-dialog v-model="dialog" max-width="300px">
    <v-card>
      <v-card-item>
        <v-card-title> ゲームを終了 </v-card-title>
      </v-card-item>
      <v-card-text> ルームを退出しますか？ </v-card-text>
      <v-card-actions>
        <v-btn variant="text" color="info" @click="$emit('close-dialog')"
          >キャンセル</v-btn
        >
        <v-spacer></v-spacer>
        <v-btn variant="text" color="info" @click="$emit('delete-room')"
          >OK</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
