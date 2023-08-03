<script setup lang="ts">
import { useConfirm } from '~/composables/useConfirm'

type Props = {
  content: string
}

withDefaults(defineProps<Props>(), {
  content: '',
})

const { isConfirmDialogOpen, onOK, onCancel, close } = useConfirm()
</script>

<template>
  <v-dialog
    v-model="isConfirmDialogOpen"
    max-width="450px"
    @click:outside="close"
  >
    <v-card>
      <v-card-text class="px-4 py-6"> {{ content }} </v-card-text>

      <v-card-actions>
        <v-btn @click="onCancel">キャンセル</v-btn>
        <v-btn class="ml-auto" @click="onOK">OK</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
