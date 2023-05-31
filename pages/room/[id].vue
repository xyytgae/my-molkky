<script setup lang="ts">
import { useRoute, useRouter } from '#app'
import {
  definePageMeta,
  ref,
  onUnmounted,
  useUser,
  useWaitingUsers,
  useWaitingRoom,
} from '#imports'
import { waitingUsersRepo } from '~/apis/waitingUser'
import { waitingRoomRepo } from '~/apis/waitingRoom'

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
const { updateOrder, createUser, deleteUser } = waitingUsersRepo
const { updateToStartFirstHalf, deleteRoom } = waitingRoomRepo

const userId = ref<string>('')
const unsubscribeUsers = ref<Function | null>(null)
const unsubscribeRoomDeletion = ref<Function | null>(null)
// const user = ref(null)
const roomId = ref<string>('')
const orderedUsers = ref([])
const order = ref(true)
const disabledOrder = ref(true)
const isHost = ref(false)
const dialog = ref(false)
const startButton = ref(true)
const stepper = ref(0)
const orderRefs = ref()

const slides = [
  '「順番を選択」を押してください',
  '投げる順番にユーザーを選択してから「順番を決定」を押してください',
  '「START」を押すとゲームが始まります選び直す場合、「順番を選択」を押してください',
]

const exit = async () => {
  unsubscribeAll()
  if (isHost.value && dialog.value) {
    await deleteUser(userId.value, roomId.value)
    await deleteRoom(roomId.value)
    router.push('/rooms')
  } else if (isHost.value) {
    dialog.value = true
  } else {
    router.push('/rooms')
    await deleteUser(userId.value, roomId.value)
  }
}

const chooseOrder = (index: any) => {
  orderRefs.value[index].click()
}

const changeOrder = () => {
  order.value = !order.value
  disabledOrder.value = !disabledOrder.value
  orderedUsers.value = []

  startButton.value = true

  // v-carouselを進める
  stepper.value = 1
}

const decideOrder = async () => {
  // 全員を選んでいない場合return
  if (orderedUsers.value.length !== users.value.length) return

  order.value = !order.value
  disabledOrder.value = !disabledOrder.value

  await updateOrder(orderedUsers.value, roomId.value)

  startButton.value = false

  // v-carouselを進める
  stepper.value = 2
}

const startGame = async () => {
  await updateToStartFirstHalf(roomId.value)
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

userId.value = loginedUser.value!.uid
roomId.value = route.params.id as string
isHost.value = roomId.value === userId.value

if (loginedUser.value && roomId.value) {
  await createUser(loginedUser.value, roomId.value)
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
    <v-app>
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
                <v-carousel-item
                  v-for="(slide, i) in slides"
                  :key="i"
                  :value="i"
                >
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
              <v-col v-for="(user, index) in users" :key="user.uid" cols="12">
                <v-card @click="chooseOrder(index)">
                  <input
                    ref="orderRefs"
                    v-model="orderedUsers"
                    type="checkbox"
                    style="display: none"
                    :value="user.id"
                    :disabled="disabledOrder"
                  />
                  <div class="d-flex flex-no-wrap">
                    <v-card-title
                      class="my-auto mx-2 pa-3 circle text-grey-darken-1"
                    >
                      {{ user.order + 1 }}
                    </v-card-title>

                    <img :src="user.iconImageUrl" class="icon" />
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

        <DeleteRoomDialog
          v-if="dialog && isHost"
          @close-dialog="dialog = false"
          @delete-room="exit()"
        />
      </v-main>
      <RoomFooter v-if="isHost" @exit-room="exit()">
        <v-btn
          v-show="order"
          variant="outlined"
          color="white"
          @click="changeOrder"
          >順番を選択</v-btn
        >
        <v-btn
          v-show="!order"
          variant="outlined"
          color="white"
          :disabled="orderedUsers.length !== users.length"
          @click="decideOrder"
          >順番を決定</v-btn
        >
        <v-spacer />
        <v-btn
          v-show="!startButton"
          variant="elevated"
          color="white"
          @click="startGame"
          >START</v-btn
        >
      </RoomFooter>

      <RoomFooter v-else @exit-room="exit()" />

      <!-- <DeleteRoomDialog v-if="isHost"></DeleteRoomDialog> -->
    </v-app>
  </div>
</template>

<style scoped>
.icon {
  width: 5rem;
  height: 5rem;
  border-radius: 40px;
  object-fit: cover;
  margin: 10px;
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
