<script setup lang="ts">
import { useRouter } from '#app'
import { mdiAccountCircle, mdiHome, mdiAccount, mdiHistory } from '@mdi/js'
import { ref, useUser } from '#imports'
import { Link } from '~/types/common'

const LINKS: Link[] = [
  {
    title: 'ルーム',
    icon: 'custom:skittles',
    url: '/rooms',
  },
  {
    title: 'プロフィール変更',
    icon: mdiAccount,
    url: '/profile',
  },
  {
    title: 'ゲーム履歴',
    icon: mdiHistory,
    url: '/gameHistory',
  },
  {
    title: 'ホーム',
    icon: mdiHome,
    url: '/',
  },
]

const router = useRouter()
const { loginedUser, logout } = useUser()

const isDrawerOpen = ref<boolean>(false)
const starCount = ref<number>(0)

const handleLogout = async () => {
  const { success } = await logout()
  if (success) {
    router.push('/login')
  }
}

/**
 * init
 */
starCount.value = loginedUser.value!.stars
</script>

<template>
  <div>
    <v-navigation-drawer v-model="isDrawerOpen" app clipped>
      <v-list>
        <v-list-item
          v-if="loginedUser"
          :title="loginedUser.name"
          class="my-4 text-black"
        >
          <template #prepend>
            <v-avatar
              v-if="loginedUser && loginedUser.iconImageUrl"
              :image="loginedUser.iconImageUrl"
              class="user-icon"
            />
            <v-icon
              v-else
              color="grey"
              class="user-icon"
              :icon="mdiAccountCircle"
            />
          </template>
        </v-list-item>
      </v-list>

      <v-divider />

      <v-list>
        <v-list-item v-for="link in LINKS" :key="link.title" :to="link.url">
          <template #prepend>
            <v-icon :icon="link.icon" color="black" size="x-large" />
          </template>
          <v-list-item-title class="text-subtitle-2 text-black">{{
            link.title
          }}</v-list-item-title>
        </v-list-item>
      </v-list>

      <template #append>
        <div class="pa-2">
          <v-btn
            v-if="loginedUser"
            block
            variant="outlined"
            rounded="xl"
            color="forest-shade"
            @click="handleLogout"
            >ログアウト</v-btn
          >
        </div>
      </template>
    </v-navigation-drawer>

    <v-app-bar flat app>
      <template #prepend>
        <v-app-bar-nav-icon @click="isDrawerOpen = !isDrawerOpen" />
      </template>

      <slot />
    </v-app-bar>
  </div>
</template>

<style scoped>
.v-app-bar {
  border-bottom: 1px solid grey;
}

.user-icon {
  width: 15vw;
  max-width: 48px;
  height: 15vw;
  max-height: 48px;
  border-radius: 50%;
  background-color: white;
}
</style>
