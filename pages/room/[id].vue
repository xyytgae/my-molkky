<script setup lang="ts">
import { useRoute, useRouter, useNuxtApp } from '#app'
import { mdiAccountCircle, mdiChevronLeft } from '@mdi/js'
import { User, CreatePlayerInput } from '~/types/api'
import {
  definePageMeta,
  ref,
  onUnmounted,
  useUser,
  usePlayers,
  useRoom,
} from '#imports'
import { playerRepo } from '~/apis/player'
import { roomRepo } from '~/apis/room'
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
const { $firebase } = useNuxtApp()
const { loginedUser } = useUser()
const { users, subscribePlayers } = usePlayers()
const { room, subscribeRoomDeletion } = useRoom()

const SLIDES: string[] = [
  '「順番を選択」を押してください',
  '投げる順番にユーザーを選択してから「順番を決定」を押してください',
  '「START」を押すとゲームが始まります選び直す場合、「順番を選択」を押してください',
]

const userId = ref<string>('')
const roomId = ref<string>('')
const unsubscribePlayers = ref<Function | null>(null)
const unsubscribeRoomDeletion = ref<Function | null>(null)
const orderedPlayerIds = ref<string[]>([])
const isOrderMode = ref<boolean>(false)
const isHost = ref<boolean>(false)
const isShowStartButton = ref<boolean>(true)
const stepper = ref<number>(0)
const orderInputRefs = ref<HTMLInputElement[] | null>(null)
const isLimitDialogOpen = ref<boolean>(false)

const exitRoom = async () => {
  if (isHost.value) {
    isDeleteRoomDialogOpen.value = true
  } else {
    unsubscribeAll()
    router.push('/rooms')
    await playerRepo.delete({
      roomId: roomId.value,
      playerId: userId.value,
    })
  }
}

const deleteRoomAndExit = async () => {
  unsubscribeAll()
  await playerRepo.delete({
    roomId: roomId.value,
    playerId: userId.value,
  })
  await roomRepo.delete({
    roomId: roomId.value,
  })
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
  await playerRepo.updateOrder({
    roomId: roomId.value,
    playerIds: orderedPlayerIds.value,
  })
  isShowStartButton.value = false

  // v-carouselを進める
  stepper.value = 2
}

const startGame = async () => {
  await roomRepo.updateToStartFirstHalf({
    roomId: roomId.value,
  })
}

const unsubscribeAll = () => {
  if (unsubscribePlayers.value) {
    unsubscribePlayers.value()
  }
  if (unsubscribeRoomDeletion.value) {
    unsubscribeRoomDeletion.value()
  }
}

onUnmounted(() => {
  unsubscribeAll()
})

const createDefaultPlayer = (user: User): CreatePlayerInput => ({
  scores: [],
  firstHalfScore: 0,
  elimination: false,
  order: 0,
  stars: user.stars,
  id: user.id,
  name: user.name,
  iconImageUrl: user.iconImageUrl,
  createdAt: $firebase.firestore.FieldValue.serverTimestamp(),
  secondHalfScore: 0,
})

/**
 * init
 */

userId.value = loginedUser.value!.id
roomId.value = route.params.id as string
isHost.value = roomId.value === userId.value

roomRepo.get({ roomId: roomId.value }).then(async ({ data }) => {
  if (!data || !loginedUser.value) return

  const numberOfPlayers = data.playerIds.length
  if (numberOfPlayers < 4) {
    const defaultPlayer = createDefaultPlayer(loginedUser.value)
    await roomRepo.addPlayerId({
      playerId: userId.value,
      roomId: roomId.value,
    })
    await playerRepo.create({
      roomId: roomId.value,
      player: defaultPlayer,
    })

    subscribePlayers(roomId.value).then(({ data }) => {
      unsubscribePlayers.value = data
    })

    subscribeRoomDeletion(userId.value, roomId.value).then(({ data }) => {
      unsubscribeRoomDeletion.value = data
    })
  } else {
    isLimitDialogOpen.value = true
  }
})
</script>

<template>
  <div>
    <v-app-bar flat>
      <v-app-bar-title>
        {{ room.name }}
      </v-app-bar-title>
    </v-app-bar>

    <v-main>
      <v-container>
        <v-row class="pb-3" justify="center" align-content="center">
          <v-col v-if="isHost" cols="12" sm="8">
            <v-carousel
              v-model="stepper"
              height="auto"
              :show-arrows="false"
              hide-delimiters
              progress="forest-shade"
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
            <v-card color="forest-shade">
              <v-card-text class="text-white">
                ホストがスタートするまでお待ちください
                <v-progress-linear stream rounded color="white" class="mb-0" />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-card class="cards mb-10" elevation="0">
          <v-row>
            <v-col v-for="(user, index) in users" :key="user.id" cols="12">
              <v-card
                color="custard-yellow"
                elevation="1"
                @click="chooseOrder(index)"
              >
                <input
                  ref="orderInputRefs"
                  v-model="orderedPlayerIds"
                  type="checkbox"
                  class="d-none"
                  :value="user.id"
                  :disabled="!isOrderMode"
                />
                <div class="d-flex flex-no-wrap align-center">
                  <v-card-title class="ordered-number d-flex mx-2">
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

                    <div><span class="text-star">★</span>×{{ user.stars }}</div>
                  </v-card-title>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <p class="text-white text-h5 my-2 mx-2">{{ users.length }}/4</p>
        </v-card>
      </v-container>

      <v-dialog
        v-model="isLimitDialogOpen"
        max-width="400"
        persistent
        scrim="warm-vanilla"
      >
        <v-card>
          <v-card-title class="py-4"> この部屋は満員です </v-card-title>
          <v-card-actions>
            <v-btn
              class="ml-auto"
              color="forest-shade"
              variant="elevated"
              @click="router.push('/rooms')"
              >部屋一覧に戻る</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <LazyDeleteRoomDialog
        v-model="isDeleteRoomDialogOpen"
        @delete-room="deleteRoomAndExit"
      />
    </v-main>

    <v-footer app fixed padless>
      <v-card tile flat class="pa-0 ma-0" width="100%">
        <v-card-actions class="pa-0">
          <v-btn icon @click="exitRoom">
            <v-icon
              color="forest-shade"
              size="x-large"
              :icon="mdiChevronLeft"
            />
          </v-btn>

          <v-spacer />

          <template v-if="isHost">
            <v-btn
              v-show="!isOrderMode"
              variant="outlined"
              color="forest-shade"
              @click="changeOrderMode"
              >順番を選択</v-btn
            >
            <v-btn
              v-show="isOrderMode"
              variant="outlined"
              color="forest-shade"
              :disabled="orderedPlayerIds.length !== users.length"
              @click="decideOrder"
              >順番を決定</v-btn
            >
            <v-spacer />

            <v-btn
              v-show="!isShowStartButton"
              variant="elevated"
              color="forest-shade"
              @click="startGame"
              >START</v-btn
            >
          </template>
        </v-card-actions>
      </v-card>
    </v-footer>
  </div>
</template>

<style scoped>
* {
  color: rgb(var(--v-theme-forest-shade));
}

.v-main {
  background-color: rgb(var(--v-theme-warm-vanilla));
  height: 100vh;
}

/* v-dialogのoverlayを上書き */
::v-deep(.v-overlay__scrim) {
  opacity: 100% !important;
}

.ordered-number {
  font-size: 2.5rem;
  font-weight: 800;
  width: 50px;
  height: 68px;
  border-radius: 50%;
  background: linear-gradient(#e9d5bd, #ecd5c1);
  color: #432e1d;
  justify-content: center;
  align-items: center;
}

.user-icon {
  width: 15vw;
  max-width: 64px;
  height: 15vw;
  max-height: 64px;
  border-radius: 50%;
  background-color: white;
}

.cards {
  background-color: rgb(var(--v-theme-forest-shade));
}

.v-carousel {
  border: 1px solid gray !important;
  border-radius: 5px !important;
}
</style>
