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

definePageMeta({
  middleware: ['check-auth'],
})

const router = useRouter()
const { loginedUser } = useUser()
const { rooms, subscribe } = useRooms()
const { $firestore, $fireStorage, $firebase } = useNuxtApp()

const errorMessages = ref('')
const tryToMoveRoom = reactive({
  name: '',
  password: null,
  id: null,
})
const dialog = ref(false)
const passwordDialog = ref(false)
const failDialog = ref(false)
const isPassword = ref(false)
const password = ref(null)
const form = reactive({
  name: {
    label: '名前',
    value: null,
  },
  image: {
    label: '画像',
    value: null,
  },
  password: {
    label: 'パスワード',
    value: null,
  },
})
const image = ref<HTMLInputElement>()

const correctPassword = (roomId: string) => {
  const isPasswordEdited = rooms.value.find((r) => r.id === roomId)
  if (isPasswordEdited && password.value === isPasswordEdited.password) {
    router.push(`/room/${roomId}`)
  }
  errorMessages.value = 'パスワードが違います'
}

const moveToRoomPage = (roomId: string) => {
  const userId = loginedUser.value!.uid
  const isPasswordEdited = rooms.value.find((r) => r.id === roomId)
  if (isPasswordEdited && userId === isPasswordEdited.hostId) {
    password.value = isPasswordEdited.password
  } else if (isPasswordEdited && password.value !== isPasswordEdited.password) {
    errorMessages.value = ''
    passwordDialog.value = true
    Object.assign(tryToMoveRoom, {
      name: isPasswordEdited.name,
      password: isPasswordEdited.password,
      id: isPasswordEdited.id,
    })
    return
  }
  router.push(`/room/${roomId}`)
}

const selectImage = () => {
  if (image.value) {
    image.value.click()
  }
}

// TODO: 型修正
const onSelectFile = (e: any) => {
  const files = e.target.files
  if (files.length === 0) return

  const reader = new FileReader()
  reader.readAsDataURL(files[0])

  reader.addEventListener('load', () => {
    upload({
      localImageFile: files[0],
    })
  })
}

const upload = async ({ localImageFile }: any) => {
  const userId = loginedUser.value!.uid

  const storageRef = $fireStorage.ref()

  const imageRef = storageRef.child(
    `images/${userId}/rooms/${localImageFile.name}`
  )

  const snapShot = await imageRef.put(localImageFile)
  form.image.value = await snapShot.ref.getDownloadURL()
}

const createRoom = async () => {
  // ダイアログを閉じる
  dialog.value = false

  const userId = loginedUser.value!.uid

  const params = {
    name: form.name.value,
    topImageUrl: form.image.value,
    createdAt: $firebase.firestore.FieldValue.serverTimestamp(),
    password: form.password.value,
    hostId: userId,
    startFirstHalf: false,
    finishFirstHalf: false,
    startSecondHalf: false,
    finishSecondHalf: false,
    delete: false,
    users: [],
  }

  try {
    await $firestore.collection('rooms').doc(userId).set(params)
  } catch (e) {
    failDialog.value = true
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
    <v-app>
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
                      @click="moveToRoomPage(room.id)"
                      >入室</v-btn
                    >
                  </v-card-actions>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-container>

        <v-row justify="center">
          <v-dialog v-model="dialog" max-width="600px">
            <v-card>
              <v-card-title class="py-4 px-6">
                <span class="text-h5">部屋を立てる</span>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-row>
                    <div class="image">
                      <v-icon
                        v-if="form.image.value"
                        size="30"
                        class="close"
                        :icon="mdiCloseCircle"
                        @click="form.image.value = null"
                      />
                      <template v-if="form.image.value">
                        <img
                          class="icon"
                          :src="form.image.value"
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
                        ref="image"
                        type="file"
                        style="display: none"
                        accept="image/*"
                        @change="onSelectFile"
                      />
                    </div>
                    <v-col cols="12">
                      <v-text-field
                        v-model="form.name.value"
                        label="部屋の名前"
                        variant="underlined"
                      />
                    </v-col>

                    <v-col cols="12">
                      <v-switch
                        v-model="isPassword"
                        :label="`パスワードを${
                          isPassword ? '設定する' : '設定しない'
                        }`"
                        color="primary"
                      />
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        v-model="form.password.value"
                        :disabled="!isPassword"
                        label="Password"
                        :required="isPassword"
                        variant="underlined"
                      />
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-btn color="blue darken-1" text @click="dialog = false"
                  >閉じる</v-btn
                >
                <v-spacer />
                <v-btn color="blue darken-1" text @click="createRoom"
                  >部屋を公開する</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="failDialog" max-width="600px">
            <v-card>
              <v-card-title>
                <v-alert type="error">
                  部屋を立てることが出来ませんでした。
                </v-alert>
              </v-card-title>
              <v-card-actions>
                <v-spacer />
                <v-btn color="blue darken-1" text @click="failDialog = false"
                  >閉じる</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-row>

        <v-dialog v-model="passwordDialog" max-width="450px">
          <v-card>
            <v-card-title class="py-4 px-6 text-wrap">
              <span class="text-h6"
                >「{{
                  tryToMoveRoom.name
                }}」のパスワードを入力してください</span
              >
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-text-field
                  v-model="password"
                  label="パスワード"
                  :error-messages="errorMessages"
                  variant="underlined"
                />
              </v-container>
            </v-card-text>

            <v-card-actions>
              <v-btn
                color="blue darken-1"
                text
                @click=";(passwordDialog = false), (password = null)"
                >閉じる</v-btn
              >
              <v-spacer />
              <v-btn
                color="blue darken-1"
                text
                @click="correctPassword(tryToMoveRoom.id)"
                >入室</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-main>
      <RoomsFooter @open-dialog="dialog = true" />
    </v-app>
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
