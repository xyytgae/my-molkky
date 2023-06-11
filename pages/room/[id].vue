<script setup lang="ts">
import { useRoute, useRouter } from '#app'
import { mdiAccountCircle } from '@mdi/js'
import {
  definePageMeta,
  ref,
  onUnmounted,
  useUser,
  useWaitingUsers,
  useWaitingRoom,
} from '#imports'
import { waitingUsersRepo } from '~/apis/player'
import { waitingRoomRepo } from '~/apis/room'
import { isDeleteRoomDialogOpen } from '~/components/DeleteRoomDialog.vue'

definePageMeta({
  middleware: ['check-auth'],
  validate: (route) => {
    if (typeof route.params.id !== 'string') return false
    return /^[a-zA-Z0-9]+$/.test(route.params.id)
  },
})

const route = useRoute()
const router = useRouter()
const { loginedUser } = useUser()
const { users, subscribeUsers } = useWaitingUsers()
const { room, subscribeRoomDeletion } = useWaitingRoom()

const SLIDES: string[] = [
  '「順番を選択」を押してください',
  '投げる順番にユーザーを選択してから「順番を決定」を押してください',
  '「START」を押すとゲームが始まります選び直す場合、「順番を選択」を押してください',
]

const userId = ref<string>('')
const roomId = ref<string>('')
const unsubscribeUsers = ref<Function | null>(null)
const unsubscribeRoomDeletion = ref<Function | null>(null)
const orderedPlayerIds = ref<string[]>([])
const isOrderMode = ref<boolean>(false)
const isHost = ref<boolean>(false)
const isShowStartButton = ref<boolean>(true)
const stepper = ref<number>(0)
const orderInputRefs = ref<HTMLInputElement[] | null>(null)

const exitRoom = async () => {
  if (isHost.value) {
    isDeleteRoomDialogOpen.value = true
  } else {
    unsubscribeAll()
    router.push('/rooms')
    await waitingUsersRepo.deleteUser(userId.value, roomId.value)
  }
}

const deleteRoomAndExit = async () => {
  unsubscribeAll()
  await waitingUsersRepo.deleteUser(userId.value, roomId.value)
  await waitingRoomRepo.deleteRoom(roomId.value)
  router.push('/rooms')
}

const chooseOrder = (index: number) => {
  if (orderInputRefs.value) {
    orderInputRefs.value[index].click()
  }
}

const changeOrderMode = () => {
  isOrderMode.value = true
  orderedPlayerIds.value = []
  isShowStartButton.value = true

  // v-carouselを進める
  stepper.value = 1
}

const decideOrder = async () => {
  // 全員を選んでいない場合return
  if (orderedPlayerIds.value.length !== users.value.length) return
  isOrderMode.value = false
  await waitingUsersRepo.updateOrder(orderedPlayerIds.value, roomId.value)
  isShowStartButton.value = false

  // v-carouselを進める
  stepper.value = 2
}

const startGame = async () => {
  await waitingRoomRepo.updateToStartFirstHalf(roomId.value)
}

const unsubscribeAll = () => {
  if (unsubscribeUsers.value) {
    unsubscribeUsers.value()
  }
  if (unsubscribeRoomDeletion.value) {
    unsubscribeRoomDeletion.value()
  }
}

onUnmounted(() => {
  unsubscribeAll()
})

/**
 * init
 */

userId.value = loginedUser.value!.id
roomId.value = route.params.id as string
isHost.value = roomId.value === userId.value

if (loginedUser.value && roomId.value) {
  await waitingUsersRepo.createUser(loginedUser.value, roomId.value)
}

subscribeUsers(roomId.value).then(({ data }) => {
  unsubscribeUsers.value = data
})

subscribeRoomDeletion(userId.value, roomId.value).then(({ data }) => {
  unsubscribeRoomDeletion.value = data
})
</script>

<template>
  <div>
    <RoomHeader :room="room" />
    <v-main class="mb-15">
      <v-container>
        <v-row class="pb-3" justify="center" align-content="center">
          <v-col v-if="isHost" cols="12" sm="8">
            <v-carousel
              v-model="stepper"
              height="auto"
              :show-arrows="false"
              hide-delimiters
              progress="primary"
            >
              <v-carousel-item v-for="(slide, i) in SLIDES" :key="i" :value="i">
                <v-sheet height="100%">
                  <div class="d-flex fill-height justify-center align-center">
                    <div class="text-h6 pa-6" v-text="slide" />
                  </div>
                </v-sheet>
              </v-carousel-item>
            </v-carousel>
          </v-col>

          <v-col v-else cols="12" sm="8">
            <v-card color="primary">
              <v-card-text>
                ホストがスタートするまでお待ちください
                <v-progress-linear indeterminate color="white" class="mb-0" />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-card class="cards mb-10">
          <v-row>
            <v-col v-for="(user, index) in users" :key="user.id" cols="12">
              <v-card @click="chooseOrder(index)">
                <input
                  ref="orderInputRefs"
                  v-model="orderedPlayerIds"
                  type="checkbox"
                  class="d-none"
                  :value="user.id"
                  :disabled="!isOrderMode"
                />
                <div class="d-flex flex-no-wrap">
                  <v-card-title
                    class="my-auto mx-2 pa-3 circle text-grey-darken-1"
                  >
                    {{ user.order + 1 }}
                  </v-card-title>

                  <v-avatar
                    v-if="user && user.iconImageUrl"
                    :image="user.iconImageUrl"
                    class="user-icon my-auto"
                  />
                  <v-icon
                    v-else
                    color="grey"
                    class="user-icon my-auto"
                    :icon="mdiAccountCircle"
                  />
                  <v-card-title class="text-h6">
                    <span>{{ user.name }}</span>

                    <div>
                      <span style="color: #ffa000">★</span>×{{ user.stars }}
                    </div>
                  </v-card-title>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <h1>{{ users.length }}/4</h1>
        </v-card>
      </v-container>

      <LazyDeleteRoomDialog
        v-model="isDeleteRoomDialogOpen"
        @delete-room="deleteRoomAndExit"
      />
    </v-main>
    <RoomFooter @exit-room="exitRoom">
      <template v-if="isHost">
        <v-btn
          v-show="!isOrderMode"
          variant="outlined"
          color="white"
          @click="changeOrderMode"
          >順番を選択</v-btn
        >
        <v-btn
          v-show="isOrderMode"
          variant="outlined"
          color="white"
          :disabled="orderedPlayerIds.length !== users.length"
          @click="decideOrder"
          >順番を決定</v-btn
        >
        <v-spacer />

        <v-btn
          v-show="!isShowStartButton"
          variant="elevated"
          color="white"
          @click="startGame"
          >START</v-btn
        >
      </template>
    </RoomFooter>
  </div>
</template>

<style scoped>
.user-icon {
  width: 15vw;
  max-width: 64px;
  height: 15vw;
  max-height: 64px;
  border-radius: 50%;
  background-color: white;
}

.cards {
  background: skyblue;
}

input:checked + div {
  background: lightgreen;
}
.circle {
  width: 50px;
  height: 50px;
  border: 1px solid gray;
  border-radius: 50%;
  text-align: center;
  box-sizing: border-box;
  line-height: 25px;
}
.v-carousel {
  border: 1px solid gray !important;
  border-radius: 5px !important;
}
</style>
