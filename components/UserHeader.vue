<script setup lang="ts">
import { useRouter } from '#app'
import { mdiAccount, mdiSwordCross, mdiHome } from '@mdi/js'
import { ref, useUser } from '#imports'

const { loginedUser, logout } = useUser()
const router = useRouter()

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

const handleLogout = async () => {
  const { success } = await logout()
  if (success) {
    router.push('/login')
  }
}
</script>

<template>
  <div>
    <v-navigation-drawer app v-model="drawer" clipped>
      <v-list>
        <v-list-item
          v-if="loginedUser"
          :prepend-avatar="loginedUser.iconImageUrl"
          :title="loginedUser.name"
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
          v-if="loginedUser"
          :image="loginedUser.iconImageUrl"
          size="large"
        />
      </nuxt-link>

      <v-app-bar-title v-if="loginedUser" class="name"
        >{{ loginedUser.name }}
        <div>
          <span class="star"> ★ </span>
          ×{{ loginedUser.stars }}
        </div>
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="loginedUser" text @click="handleLogout">ログアウト</v-btn>
      <v-btn v-else text @click="router.push('/login')">ログイン</v-btn>
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
