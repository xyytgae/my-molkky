<template>
  <v-app>
    <v-card class="mx-auto mt-5 " width="350">
      <!-- <v-container> -->
      <v-card-title>
        <h1 class="display-1 mx-auto">ログイン</h1>
      </v-card-title>

      <v-divider class="mx-7"></v-divider>

      <v-card-actions>
        <v-row>
          <v-col class="text-center">
            <v-btn color="info" x-large @click="login">Googleでログイン</v-btn>
          </v-col>
          <v-col class="text-center">
            <v-btn
              color="primary"
              large
              @click="guest('test1@example.com', '123456')"
              >デモアカウント1でログイン</v-btn
            >
          </v-col>
          <v-col class="text-center">
            <v-btn
              color="primary"
              large
              @click="guest('test2@example.com', '123456')"
              >デモアカウント2でログイン</v-btn
            >
          </v-col>
        </v-row>
      </v-card-actions>
      <!-- </v-container> -->
    </v-card>

    <v-overlay :value="overlay">
      <v-progress-circular indeterminate size="128"
        >ログイン中...</v-progress-circular
      >
    </v-overlay>
  </v-app>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  middleware: ['checkLogin'],
  data() {
    return {
      overlay: false,
    }
  },
  methods: {
    ...mapActions('main', ['login', 'guestLogin']),
    guest(email, password) {
      this.overlay = true
      this.guestLogin({ email, password })
    },
  },
}
</script>
