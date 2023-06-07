<script lang="ts">
import { ref } from '#imports'

export const isDeleteRoomDialogOpen = ref<boolean>(false)
</script>

<script setup lang="ts">
type Props = {
  modelValue: boolean
}
type Emits = {
  (e: 'update:modelValue', value: boolean): void
  (e: 'deleteRoom'): void
}

withDefaults(defineProps<Props>(), {
  modelValue: false,
})
const emit = defineEmits<Emits>()
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    max-width="300px"
    @click:outside="emit('update:modelValue', false)"
  >
    <v-card>
      <v-card-item>
        <v-card-title> ゲームを終了 </v-card-title>
      </v-card-item>
      <v-card-text> ルームを退出しますか？ </v-card-text>
      <v-card-actions>
        <v-btn
          variant="text"
          color="info"
          @click="emit('update:modelValue', false)"
          >キャンセル</v-btn
        >
        <v-spacer />
        <v-btn variant="text" color="info" @click="emit('deleteRoom')"
          >OK</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
