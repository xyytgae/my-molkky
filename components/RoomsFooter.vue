<template>
  <v-footer fixed padless>
    <v-card tile flat color="primary" class="lighten-1" width="100%">
      <v-card-actions>
        <!-- <v-btn color="indigo" dark fab to="/">
          <v-icon>mdi-home</v-icon>
        </v-btn> -->
        <v-btn dark text fab to="/">
          <v-icon x-large>mdi-home</v-icon>
        </v-btn>

        <v-spacer></v-spacer>

        <!-- <v-btn color="green" dark fab @click="$emit('open-dialog')">
          <v-icon>mdi-plus</v-icon>
        </v-btn> -->
        <v-btn text dark fab @click="$emit('open-dialog')">
          <v-icon x-large>mdi-plus</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-footer>
</template>

<style scoped></style>
