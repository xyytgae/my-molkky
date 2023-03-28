<script setup lang="ts">
import { useNuxtApp, useRoute, useRouter } from '#app'
import { useRoomStore } from '~/store/room'
import { definePageMeta, ref, onUnmounted } from '#imports'

definePageMeta({
  middleware: ['check-auth'],
})
const route = useRoute()
const router = useRouter()
const { $user } = useNuxtApp()
const { getterRoom, setUser, subscribe, start, clear, exitRoom, deleteRoom } =
  useRoomStore()

const userId = ref(null)
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
const stepper = ref(1)
const orderRefs = ref()

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

  // v-stepperを進める
  stepper.value = 2
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

  // v-stepperを進める
  stepper.value = 3
}

const startGame = async () => {
  if (unsubscribe.value) {
    unsubscribe.value()
  }
  // await this.$store.dispatch('room/clear')
  await useRoomStore().startGame({ roomId: roomId.value })
}

/**
 * init
 */

const user = await $user
userId.value = user.uid
roomId.value = route.params.id
isHost.value = roomId.value === user.uid

await setUser({ user, roomId: roomId.value })

// const store = useRoomStore()

unsubscribe.value = await subscribe({ roomId: roomId.value })
unstart.value = await start({
  userId: userId.value,
  roomId: roomId.value,
})

onUnmounted(async () => {
  const user = await $user
  const userId = user.uid

  if (unsubscribe.value) {
    unsubscribe.value()
  }
  if (unstart.value) {
    unstart.value()
  }
  clear()
})
</script>

<template>
  <div>
    <v-app>
      <RoomHeader></RoomHeader>
      <v-main class="mb-15">
        <v-container>
          <v-row class="pb-3" justify="center" align-content="center">
            <v-col cols="10" v-if="isHost">
              <v-stepper v-model="stepper" value="1" class="pb-4" vertical>
                <v-stepper-step :complete="stepper > 1" color="info" step="1">
                  「順番を選択」
                </v-stepper-step>
                <v-stepper-content step="1">
                  <v-card dark color="#001e43">
                    <v-card-text> 「順番を選択」を押してください </v-card-text>
                  </v-card>
                </v-stepper-content>

                <v-stepper-step :complete="stepper > 2" color="info" step="2">
                  「順番を決定」
                </v-stepper-step>
                <v-stepper-content step="2">
                  <v-card dark color="#001e43">
                    <v-card-text style="font-size: 14px">
                      投げる順番にユーザーを選択してから<br />
                      「順番を決定」を押してください
                    </v-card-text>
                  </v-card>
                </v-stepper-content>

                <v-stepper-step color="info" step="3">
                  「START」
                </v-stepper-step>
                <v-stepper-content step="3">
                  <v-card dark color="#001e43">
                    <v-card-text style="font-size: 14px">
                      「START」を押すとゲームが始まります<br />
                      選び直す場合、「順番を選択」を押してください
                    </v-card-text>
                  </v-card>
                </v-stepper-content>
              </v-stepper>
            </v-col>

            <v-col cols="10" v-else>
              <v-card color="#001e43" dark>
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
                    <v-card-title>
                      <v-icon x-large
                        >mdi-numeric-{{ user.order + 1 }}-circle</v-icon
                      >
                    </v-card-title>

                    <img :src="user.iconImageUrl" class="icon" />
                    <v-card-title class="headline">
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
        <v-btn color="green" v-show="order" @click="changeOrder"
          >順番を選択</v-btn
        >
        <v-btn
          color="white"
          v-show="!order"
          :disabled="orderedUsers.length !== getterRoom.length"
          @click="decideOrder"
          >順番を決定</v-btn
        >
        <v-spacer></v-spacer>
        <v-btn :disabled="startButton" outlined @click="startGame">START</v-btn>
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
</style>
