<script setup lang="ts">
import { useRouter } from '#app'
import { mdiHome, mdiAccountCircle, mdiAccountGroup } from '@mdi/js'
import { useUser, definePageMeta } from '#imports'

definePageMeta({
  middleware: ['check-auth'],
})

const MODES = [
  {
    title: 'みんなで対戦',
    icon: mdiAccountGroup,
  },
] as const

const router = useRouter()
const { loginedUser } = useUser()

/**
 * init
 */
</script>

<template>
  <div>
    <MainHeader>
      <nuxt-link to="/profile">
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
      </nuxt-link>

      <v-app-bar-title v-if="loginedUser"
        >{{ loginedUser.name }}
        <div>
          <span class="star"> ★ </span>
          ×{{ loginedUser.stars }}
        </div>
      </v-app-bar-title></MainHeader
    >

    <v-main>
      <v-container>
        <v-row v-for="mode in MODES" :key="mode.title" dense>
          <v-col cols="12">
            <v-card
              class="mode mx-auto"
              color="custard-yellow"
              @click="router.push('/rooms')"
            >
              <v-icon :icon="mode.icon" class="mode-icon mx-auto d-block" />

              <v-card-title class="text-h5 my-auto text-center">
                {{ mode.title }}
              </v-card-title>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>

    <v-footer app fixed padless>
      <v-card tile flat width="100%">
        <v-card-actions class="pa-0">
          <v-btn :icon="mdiHome" size="large" to="/" />
        </v-card-actions>
      </v-card>
    </v-footer>
  </div>
</template>

<style scoped>
* {
  color: rgb(var(--v-theme-forest-shade));
}
.v-footer {
  border-top: 1px solid grey;
}
.v-main {
  background-color: rgb(var(--v-theme-warm-vanilla));
  height: 100vh;
}

.mode {
  max-width: 480px;
}

.mode-icon {
  width: 20vw;
  max-width: 120px;
  height: 10vh;
  max-height: 120px;
}
</style>
