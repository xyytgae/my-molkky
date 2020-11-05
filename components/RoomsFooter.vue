<template>
  <v-footer app fixed padless>
    <v-card tile flat color="primary" class="lighten-1" width="100%">
      <v-card-actions>
        <v-btn dark text fab to="/">
          <v-icon x-large>mdi-home</v-icon>
        </v-btn>

        <v-spacer></v-spacer>

        <v-btn text dark @click="$emit('open-dialog')">
          <v-icon large>mdi-plus</v-icon>
          <span>部屋を作成</span>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-footer>
</template>

<style scoped></style>
