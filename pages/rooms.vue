<script setup lang="ts">
import { useNuxtApp, useRouter } from '#app'
import { mdiLock, mdiCloseCircle, mdiImage } from '@mdi/js'
import {
  ref,
  reactive,
  onUnmounted,
  useUser,
  definePageMeta,
  useRooms,
} from '#imports'
import { RoomStatus, Room } from '~~/types/api'
import { waitingRoomRepo } from '~~/apis/waitingRoom'

type RoomCreationInputs = {
  name: string
  image: string
  password: string
  isPasswordSet: boolean
}

definePageMeta({
  middleware: ['check-auth'],
})

const router = useRouter()
const { loginedUser } = useUser()
const { rooms, subscribe } = useRooms()
const { $fireStorage, $firebase } = useNuxtApp()

const errorMessages = ref<string>('')

const isCreateRoomDialogOpen = ref<boolean>(false)
const isPasswordInputDialogOpen = ref<boolean>(false)
const isErrorDialogOpen = ref<boolean>(false)

const roomEntryPasswordInput = ref<string>('')
const roomCreationInputs = reactive<RoomCreationInputs>({
  name: '',
  image: '',
  password: '',
  isPasswordSet: false,
})
const inputRef = ref<HTMLInputElement | null>(null)
const selectedRoom = ref<Room | null>(null)

const closePasswordInputDialog = () => {
  isPasswordInputDialogOpen.value = false
  roomEntryPasswordInput.value = ''
}

const verifyPassword = () => {
  if (
    selectedRoom.value &&
    roomEntryPasswordInput.value === selectedRoom.value.password
  ) {
    router.push(`/room/${selectedRoom.value.id}`)
  } else {
    errorMessages.value = 'パスワードが違います'
  }
}

const moveToRoomPage = (room: Room) => {
  const userId = loginedUser.value!.id
  selectedRoom.value = { ...room }
  if (selectedRoom.value && userId === selectedRoom.value.hostId) {
    roomEntryPasswordInput.value = selectedRoom.value.password
  } else if (selectedRoom.value && selectedRoom.value.password !== '') {
    errorMessages.value = ''
    isPasswordInputDialogOpen.value = true
    return
  }
  router.push(`/room/${selectedRoom.value.id}`)
}

const selectImage = () => {
  if (inputRef.value) {
    inputRef.value.click()
  }
}

const onSelectFile = (e: Event) => {
  if (!(e.target instanceof HTMLInputElement)) {
    return
  }

  const files = e.target.files
  if (files === null || files.length === 0) return

  const reader = new FileReader()
  reader.readAsDataURL(files[0])

  reader.addEventListener('load', () => {
    upload({
      localImageFile: files[0],
    })
  })
}

const upload = async ({ localImageFile }: { localImageFile: File }) => {
  const userId = loginedUser.value!.id

  const storageRef = $fireStorage.ref()

  const imageRef = storageRef.child(
    `images/${userId}/rooms/${localImageFile.name}`
  )

  const snapShot = await imageRef.put(localImageFile)
  roomCreationInputs.image = await snapShot.ref.getDownloadURL()
}

const createRoom = async () => {
  // ダイアログを閉じる
  isCreateRoomDialogOpen.value = false

  const userId = loginedUser.value!.id

  const status: RoomStatus = 'NOT_STARTED'
  const input = {
    name: roomCreationInputs.name,
    topImageUrl: roomCreationInputs.image,
    createdAt: $firebase.firestore.FieldValue.serverTimestamp(),
    password: roomCreationInputs.password,
    hostId: userId,
    delete: false,
    playerIds: [],
    status,
  }

  const { success } = await waitingRoomRepo.createRoom(input)
  if (!success) {
    isErrorDialogOpen.value = true
  }
}
/**
 * init
 */
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

      <v-row justify="center">
        <v-dialog v-model="isCreateRoomDialogOpen" max-width="600px">
          <v-card>
            <v-card-title class="py-4 px-6">
              <span class="text-h5">部屋を立てる</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <div class="image">
                    <v-icon
                      v-if="roomCreationInputs.image"
                      size="30"
                      class="close"
                      :icon="mdiCloseCircle"
                      @click="roomCreationInputs.image = ''"
                    />
                    <template v-if="roomCreationInputs.image">
                      <img
                        class="icon"
                        :src="roomCreationInputs.image"
                        @click="selectImage"
                      />
                    </template>
                    <template v-else>
                      <v-icon
                        size="80"
                        :icon="mdiImage"
                        color="grey lighten-1"
                        @click="selectImage"
                      />
                    </template>
                    <input
                      ref="inputRef"
                      type="file"
                      style="display: none"
                      accept="image/*"
                      @change="onSelectFile"
                    />
                  </div>
                  <v-col cols="12">
                    <v-text-field
                      v-model="roomCreationInputs.name"
                      label="部屋の名前"
                      variant="underlined"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-switch
                      v-model="roomCreationInputs.isPasswordSet"
                      :label="`パスワードを${
                        roomCreationInputs.isPasswordSet
                          ? '設定する'
                          : '設定しない'
                      }`"
                      color="primary"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="roomCreationInputs.password"
                      :disabled="!roomCreationInputs.isPasswordSet"
                      label="Password"
                      :required="roomCreationInputs.isPasswordSet"
                      variant="underlined"
                    />
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-btn
                color="blue darken-1"
                text
                @click="isCreateRoomDialogOpen = false"
                >閉じる</v-btn
              >
              <v-spacer />
              <v-btn color="blue darken-1" text @click="createRoom"
                >部屋を公開する</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="isErrorDialogOpen" max-width="600px">
          <v-card>
            <v-card-title>
              <v-alert type="error">
                部屋を立てることが出来ませんでした。
              </v-alert>
            </v-card-title>
            <v-card-actions>
              <v-spacer />
              <v-btn
                color="blue darken-1"
                text
                @click="isErrorDialogOpen = false"
                >閉じる</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>

      <v-dialog
        v-if="selectedRoom"
        v-model="isPasswordInputDialogOpen"
        max-width="450px"
      >
        <v-card>
          <v-card-title class="py-4 px-6 text-wrap">
            <span class="text-h6"
              >「{{ selectedRoom.name }}」のパスワードを入力してください</span
            >
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-text-field
                v-model="roomEntryPasswordInput"
                label="パスワード"
                :error-messages="errorMessages"
                variant="underlined"
              />
            </v-container>
          </v-card-text>

          <v-card-actions>
            <v-btn color="blue darken-1" text @click="closePasswordInputDialog"
              >閉じる</v-btn
            >
            <v-spacer />
            <v-btn color="blue darken-1" text @click="verifyPassword"
              >入室</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
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

.image {
  position: relative;
  width: 10rem;
  height: 10rem;
  margin-left: auto;
  margin-right: auto;
  background: rgba(237, 242, 247, 1);
  border-radius: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.close {
  position: absolute;
  top: -10px;
  right: -10px;
  /* top: -75px;
  right: -340px; */
  /* z-index: 100; */
  /* width: ; */
}

.icon {
  width: 10rem;
  height: 10rem;
  /* max-width: 100%; */
  /* height: 12rem; */
  /* max-height: 100%; */
  /* width: 200px; */
  /* height: 200px; */
  border-radius: 30px;
  object-fit: cover;
}

.v-speed-dial {
  position: absolute;
}

.v-btn--floating {
  position: relative;
}
</style>
