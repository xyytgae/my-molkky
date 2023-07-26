<script setup lang="ts">
import { useRouter } from '#app'
import { mdiLock, mdiHome, mdiPlus, mdiAccountCircle } from '@mdi/js'
import {
  ref,
  onUnmounted,
  useUser,
  definePageMeta,
  useRooms,
  provide,
} from '#imports'
import { Room } from '~/types/api'
import { isCreateRoomDialogOpen } from '~/fragments/CreateRoomDialog.vue'
import { isPasswordInputDialogOpen } from '~/fragments/PasswordInputDialog.vue'
import { useErrorDialog, ErrorDialogKey } from '~/compositions/useErrorDialog'

definePageMeta({
  middleware: ['check-auth'],
})

provide(ErrorDialogKey, useErrorDialog())

const router = useRouter()
const { loginedUser } = useUser()
const { rooms, subscribe } = useRooms()

const userId = ref<string>('')
const errorMessages = ref<string>('')

const selectedRoom = ref<Room | null>(null)

const moveToRoomPage = (room: Room) => {
  selectedRoom.value = { ...room }
  if (
    selectedRoom.value.password !== '' &&
    userId.value !== selectedRoom.value.hostId
  ) {
    errorMessages.value = ''
    isPasswordInputDialogOpen.value = true
    return
  }
  router.push(`/room/${selectedRoom.value.id}`)
}

/**
 * init
 */
userId.value = loginedUser.value!.id
const { data } = await subscribe()
onUnmounted(() => {
  if (data) {
    data()
  }
})
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
        <v-row v-for="room in rooms" :key="room.id" dense>
          <v-col cols="12">
            <v-card
              class="room-item d-flex flex-no-wrap"
              color="custard-yellow"
            >
              <v-card-title class="text-h6 my-auto">
                {{ room.name }}
                <v-icon v-if="room.password" :icon="mdiLock" />
              </v-card-title>

              <v-spacer />

              <v-card-actions>
                <v-btn
                  color="forest-shade"
                  variant="elevated"
                  @click="moveToRoomPage(room)"
                  >入室</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>

      <LazyCreateRoomDialog
        v-model="isCreateRoomDialogOpen"
        :user-id="userId"
      />
      <LazyPasswordInputDialog
        v-model="isPasswordInputDialogOpen"
        :selected-room="selectedRoom"
      />
      <LazyErrorDialog />
    </v-main>

    <v-footer app fixed padless>
      <v-card tile flat width="100%">
        <v-card-actions class="pa-0">
          <v-btn :icon="mdiHome" size="large" to="/" />

          <v-spacer />

          <v-btn :prepend-icon="mdiPlus" @click="isCreateRoomDialogOpen = true">
            <template #prepend>
              <v-icon size="x-large" />
            </template>
            <span>部屋を作成</span>
          </v-btn>
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

.room-item {
  height: 5rem;
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
