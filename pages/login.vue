<template>
  <v-app>
    <v-card class="mx-auto mt-5 " width="350">
      <!-- <v-container> -->
      <v-card-title>
        <h1 class="display-1 mx-auto">ログイン</h1>
      </v-card-title>

      <v-divider class="mx-7"></v-divider>

      <v-card-actions>
        <v-btn color="info mx-auto" x-large @click="login"
          >Googleでログイン</v-btn
        >
      </v-card-actions>
      <!-- </v-container> -->
    </v-card>
  </v-app>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  middleware: ['checkLogin'],
  methods: {
    ...mapActions('main', ['login']),
  },
}
</script>
