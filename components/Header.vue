<template>
  <v-app-bar app color="primary" dark>
    <slot />

    <!-- <v-app-bar-nav-icon></v-app-bar-nav-icon>
    <nuxt-link to="/profile">
      <v-avatar v-if="getterRegistered_user">
        <img :src="getterRegistered_user.iconImageUrl" />
      </v-avatar>
    </nuxt-link>

    <v-toolbar-title v-if="getterRegistered_user" class="name">{{
      getterRegistered_user.name
    }}</v-toolbar-title>
    <v-spacer></v-spacer>
    <v-toolbar-items>
      <v-btn text>
        <span v-if="getterLogin_user" @click="logout">ログアウト</span>
        <span v-else @click="login">ログイン</span>
      </v-btn>
    </v-toolbar-items> -->
  </v-app-bar>
</template>

<script>
// import { mapState, mapActions } from 'pinia'
// import { useMainStore } from '~/store/main'

// export default {
//   methods: {
//     ...mapActions(useMainStore, [
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
//     ...mapState(useMainStore, ['getterLogin_user', 'getterRegistered_user']),
//   },
// }
</script>

<style scoped>
/* .name {
  padding-left: 20px;
} */
</style>
