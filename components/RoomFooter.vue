<script setup lang="ts">
import { mdiChevronLeft } from '@mdi/js'
</script>

<template>
  <div>
    <v-footer fixed padless>
      <v-card tile flat color="primary" class="lighten-1" width="100%">
        <v-card-actions>
          <v-btn icon @click="$emit('exit-room')">
            <v-icon color="white" size="x-large" :icon="mdiChevronLeft" />
          </v-btn>

          <v-spacer />

          <slot />
        </v-card-actions>
      </v-card>
    </v-footer>
  </div>
</template>
