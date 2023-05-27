<script setup lang="ts">
import { useRoute, useRouter } from '#app'
import { useRoomStore } from '~/store/room'
import { definePageMeta, ref, onUnmounted, useUser } from '#imports'

definePageMeta({
  middleware: ['check-auth'],
})
const route = useRoute()
const router = useRouter()
const { loginedUser } = useUser()
const { getterRoom, setUser, subscribe, start, clear, exitRoom, deleteRoom } =
  useRoomStore()

const userId = ref<string | null>(null)
const unsubscribe = ref(null)
const unstart = ref(null)
// const user = ref(null)
const roomId = ref(null)
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
  if (isHost.value && dialog.value) {
    await exitRoom({ userId: userId.value, roomId: roomId.value })
    await deleteRoom({ roomId: roomId.value })
    router.push('/rooms')
  } else if (isHost.value) {
    dialog.value = true
  } else {
    router.push('/rooms')
    await exitRoom({ userId: userId.value, roomId: roomId.value })
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
  if (orderedUsers.value.length !== getterRoom.length) return

  order.value = !order.value
  disabledOrder.value = !disabledOrder.value

  await useRoomStore().decideOrder({
    users: orderedUsers.value,
    roomId: roomId.value,
  })

  startButton.value = false

  // v-carouselを進める
  stepper.value = 2
}

const startGame = async () => {
  if (unsubscribe.value) {
    unsubscribe.value()
  }
  // await this.$store.dispatch('room/clear')
  await useRoomStore().startGame({ roomId: roomId.value })
}

onUnmounted(() => {
  if (unsubscribe.value) {
    unsubscribe.value()
  }
  if (unstart.value) {
    unstart.value()
  }
  clear()
})

/**
 * init
 */

userId.value = loginedUser.value!.uid
roomId.value = route.params.id
isHost.value = roomId.value === userId.value

await setUser({ user: loginedUser.value, roomId: roomId.value })

// const store = useRoomStore()

unsubscribe.value = await subscribe({ roomId: roomId.value })
unstart.value = await start({
  userId: userId.value,
  roomId: roomId.value,
})
</script>

<template>
  <div>
    <v-app>
      <RoomHeader></RoomHeader>
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
                      <div class="text-h6 pa-6" v-text="slide"></div>
                    </div>
                  </v-sheet>
                </v-carousel-item>
              </v-carousel>
            </v-col>

            <v-col v-else cols="12" sm="8">
              <v-card color="primary">
                <v-card-text>
                  ホストがスタートするまでお待ちください
                  <v-progress-linear
                    indeterminate
                    color="white"
                    class="mb-0"
                  ></v-progress-linear>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-card class="cards mb-10">
            <v-row>
              <v-col
                cols="12"
                v-for="(user, index) in getterRoom"
                :key="user.uid"
              >
                <v-card @click="chooseOrder(index)">
                  <input
                    ref="orderRefs"
                    type="checkbox"
                    style="display: none"
                    v-model="orderedUsers"
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

            <h1>{{ getterRoom.length }}/4</h1>
          </v-card>
        </v-container>

        <DeleteRoomDialog
          v-if="dialog && isHost"
          @close-dialog="dialog = false"
          @delete-room="exit()"
        ></DeleteRoomDialog>
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
          :disabled="orderedUsers.length !== getterRoom.length"
          @click="decideOrder"
          >順番を決定</v-btn
        >
        <v-spacer></v-spacer>
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
