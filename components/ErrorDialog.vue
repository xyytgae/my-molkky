<script setup lang="ts">
import { inject } from '#imports'
import { ErrorDialogStore, ErrorDialogKey } from '~/compositions/useErrorDialog'

const { isErrorDialogOpen, errorMessage } = inject(
  ErrorDialogKey
) as ErrorDialogStore
</script>

<template>
  <v-dialog
    :model-value="isErrorDialogOpen"
    max-width="600px"
    @click:outside="isErrorDialogOpen = false"
  >
    <v-card>
      <v-card-title>
        <v-alert type="error">
          {{ errorMessage }}
        </v-alert>
      </v-card-title>
      <v-card-actions>
        <v-spacer />
        <v-btn color="blue darken-1" text @click="isErrorDialogOpen = false"
          >閉じる</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped></style>
