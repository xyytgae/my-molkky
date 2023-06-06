<script setup lang="ts">
import { useRouter } from '#app'
import { mdiLock } from '@mdi/js'
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
    <UserHeader />

    <v-main class="main">
      <v-container>
        <v-row v-for="room in rooms" :key="room.id" dense>
          <v-col cols="12">
            <v-card>
              <div class="d-flex flex-no-wrap">
                <img :src="room.topImageUrl" class="room-icon" />
                <v-card-title class="text-h6 my-auto">
                  {{ room.name }}
                  <v-icon v-if="room.password" :icon="mdiLock" />
                </v-card-title>

                <v-spacer />

                <v-card-actions>
                  <v-btn
                    color="primary"
                    variant="elevated"
                    @click="moveToRoomPage(room)"
                    >入室</v-btn
                  >
                </v-card-actions>
              </div>
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
    <RoomsFooter @open-dialog="isCreateRoomDialogOpen = true" />
  </div>
</template>

<style scoped>
.main {
  margin-bottom: 200px;
}

.room-icon {
  width: 5rem;
  height: 5rem;
  border-radius: 40px;
  object-fit: cover;
}
</style>
