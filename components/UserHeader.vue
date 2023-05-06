<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useNuxtApp, useRouter } from '#app'
import { mdiAccount, mdiSwordCross, mdiHome } from '@mdi/js'
import { useMainStore } from '~/store/main'
import { ref } from '#imports'

const router = useRouter()
const {
  logout,
  setLoginUser,
  deleteLoginUser,
  getRegisteredUser,
  getGameHistory,
} = useMainStore()
const { getterLogin_user, getterRegistered_user } = storeToRefs(useMainStore())
const { $fireAuth } = useNuxtApp()

const login = () => {
  router.push('/login')
}

const drawer = ref(null)
const link_lists = ref([
  {
    title: 'プロフィール変更',
    icon: mdiAccount,
    link: '/profile',
  },
  {
    title: 'ゲーム履歴',
    icon: mdiSwordCross,
    link: '/gameHistory',
  },
  {
    title: 'ホーム',
    icon: mdiHome,
    link: '/',
  },
])

/**
 * init
 */

await $fireAuth.onAuthStateChanged((user) => {
  if (user) {
    const { uid, displayName, email } = user
    setLoginUser({ uid, displayName, email })
    getRegisteredUser({ uid })
  } else {
    deleteLoginUser()
    router.push('/login')
  }
})
</script>

<template>
  <div>
    <v-navigation-drawer app v-model="drawer" clipped>
      <v-list>
        <v-list-item
          v-if="getterRegistered_user"
          :prepend-avatar="getterRegistered_user.iconImageUrl"
          :title="getterRegistered_user.name"
          class="my-4"
        />
      </v-list>

      <v-divider></v-divider>

      <v-list dense>
        <v-list-item
          v-for="link_list in link_lists"
          :key="link_list.title"
          :to="link_list.link"
        >
          <template #prepend>
            <v-icon :icon="link_list.icon" />
          </template>
          <v-list-item-title class="text-subtitle-2">{{
            link_list.title
          }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar app color="primary" dark>
      <template #prepend>
        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      </template>
      <nuxt-link to="/profile">
        <v-avatar
          v-if="getterRegistered_user"
          :image="getterRegistered_user.iconImageUrl"
          size="large"
        />
      </nuxt-link>

      <v-app-bar-title v-if="getterRegistered_user" class="name"
        >{{ getterRegistered_user.name }}
        <div>
          <span class="star"> ★ </span>
          ×{{ getterRegistered_user.stars }}
        </div>
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="getterLogin_user" text @click="logout">ログアウト</v-btn>
      <v-btn v-else text @click="login">ログイン</v-btn>
    </v-app-bar>
  </div>
</template>

<style scoped>
.name {
  padding-left: 10px;
}

.star {
  color: #ffa000;
}
</style>
