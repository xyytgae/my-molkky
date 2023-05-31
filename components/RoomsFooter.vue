<script setup lang="ts">
import { mdiHome, mdiPlus } from '@mdi/js'
</script>

<template>
  <v-footer app fixed padless>
    <v-card tile flat color="primary" class="lighten-1" width="100%">
      <v-card-actions>
        <v-btn :icon="mdiHome" size="large" to="/" />

        <v-spacer />

        <v-btn :prepend-icon="mdiPlus" @click="$emit('open-dialog')">
          <template #prepend>
            <v-icon size="x-large" />
          </template>
          <span>部屋を作成</span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-footer>
</template>

<style scoped></style>
