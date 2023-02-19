<template>
  <div>
    <v-navigation-drawer app v-model="drawer" clipped>
      <v-container>
        <v-list-item v-if="getterRegistered_user" class="mb-4">
          <v-avatar v-if="getterRegistered_user" class="mr-2">
            <img :src="getterRegistered_user.iconImageUrl" />
          </v-avatar>
          <v-list-item-content>
            <v-list-item-title class="title grey--text text--darken-2">{{
              getterRegistered_user.name
            }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>

        <v-divider></v-divider>

        <v-list dense>
          <v-list-item
            v-for="link_list in link_lists"
            :key="link_list.name"
            :to="link_list.link"
          >
            <v-list-item-icon>
              <v-icon>{{ link_list.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>{{ link_list.title }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-container>
    </v-navigation-drawer>
    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <nuxt-link to="/profile">
        <v-avatar v-if="getterRegistered_user">
          <img :src="getterRegistered_user.iconImageUrl" />
        </v-avatar>
      </nuxt-link>

      <v-toolbar-title v-if="getterRegistered_user" class="name"
        >{{ getterRegistered_user.name }}
        <div>
          <span class="star"> ★ </span>
          ×{{ getterRegistered_user.stars }}
        </div>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn text>
          <span v-if="getterLogin_user" @click="logout">ログアウト</span>
          <span v-else @click="login">ログイン</span>
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useMainStore } from '~/store/main'

export default {
  methods: {
    ...mapActions(useMainStore, [
      'logout',
      'setLoginUser',
      'deleteLoginUser',
      'getRegisteredUser',
      'getGameHistory',
    ]),
    login() {
      this.$router.push('/login')
    },
  },
  async created() {
    await this.$fireAuth.onAuthStateChanged((user) => {
      if (user) {
        const { uid, displayName, email } = user
        this.setLoginUser({ uid, displayName, email })
        this.getRegisteredUser({ uid })
      } else {
        this.deleteLoginUser()
        this.$router.push('/login')
      }
    })
  },
  data() {
    return {
      drawer: null,
      link_lists: [
        {
          title: 'プロフィール変更',
          icon: 'mdi-account',
          link: '/profile',
        },
        {
          title: 'ゲーム履歴',
          icon: 'mdi-sword-cross',
          link: '/gameHistory',
        },
        {
          title: 'ホーム',
          icon: 'mdi-home',
          link: '/',
        },
      ],
    }
  },
  computed: {
    ...mapState(useMainStore, ['getterLogin_user', 'getterRegistered_user']),
  },
}
</script>

<style scoped>
.name {
  padding-left: 10px;
}

.star {
  color: #ffa000;
}
</style>
