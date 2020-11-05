<template>
  <v-footer fixed padless height="70px">
    <v-card tile flat color="primary" class="lighten-1" width="100%">
      <v-card-actions>
        <v-spacer></v-spacer>
        <slot />
        <!-- <v-spacer></v-spacer> -->
      </v-card-actions>
    </v-card>
  </v-footer>
</template>
