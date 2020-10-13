<template>
  <v-app-bar app color="primary" dark>
    <slot />

    <!-- <v-app-bar-nav-icon></v-app-bar-nav-icon>
    <nuxt-link to="/profile">
      <v-avatar v-if="registered_user">
        <img :src="registered_user.iconImageUrl" />
      </v-avatar>
    </nuxt-link>

    <v-toolbar-title v-if="registered_user" class="name">{{
      registered_user.name
    }}</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-toolbar-items>
      <v-btn text>
        <span v-if="login_user" @click="logout">ログアウト</span>
        <span v-else @click="login">ログイン</span>
      </v-btn>
    </v-toolbar-items> -->
  </v-app-bar>
</template>

<script>
// import { mapActions, mapGetters } from 'vuex'

// export default {
//   methods: {
//     ...mapActions('main', [
//       'logout',
//       'setLoginUser',
//       'deleteLoginUser',
//       'getRegisteredUser',
//     ]),
//     login() {
//       this.$router.push('/login')
//     },
//   },
//   async created() {
//     await this.$fireAuth.onAuthStateChanged(user => {
//       if (user) {
//         const { uid, displayName, email } = user
//         this.setLoginUser({ uid, displayName, email })
//         this.getRegisteredUser({ uid })
//       } else {
//         this.deleteLoginUser()
//       }
//     })
//   },
//   computed: {
//     ...mapGetters('main', ['login_user', 'registered_user']),
//   },
// }
</script>

<style scoped>
/* .name {
  padding-left: 20px;
} */
</style>
