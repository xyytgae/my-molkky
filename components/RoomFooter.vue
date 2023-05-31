<script setup lang="ts">
import { mdiChevronLeft } from '@mdi/js'

interface Emits {
  (e: 'exitRoom'): void
}

defineEmits<Emits>()
</script>

<template>
  <div>
    <v-footer fixed padless>
      <v-card tile flat color="primary" class="lighten-1" width="100%">
        <v-card-actions>
          <v-btn icon @click="$emit('exitRoom')">
            <v-icon color="white" size="x-large" :icon="mdiChevronLeft" />
          </v-btn>

          <v-spacer />

          <slot />
        </v-card-actions>
      </v-card>
    </v-footer>
  </div>
</template>
