<template>
  <div>
    <v-footer fixed padless>
      <v-card tile flat color="primary" class="lighten-1" width="100%">
        <v-card-actions>
          <v-btn dark text fab @click="$emit('exit-room')">
            <v-icon x-large>mdi-chevron-left</v-icon>
          </v-btn>

          <v-spacer></v-spacer>

          <slot />
        </v-card-actions>
      </v-card>
    </v-footer>
  </div>
</template>
