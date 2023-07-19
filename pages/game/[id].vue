<script setup lang="ts">
import { useRoute } from '#app'
import { mdiAccountCircle, mdiDrag } from '@mdi/js'
import {
  definePageMeta,
  ref,
  computed,
  onUnmounted,
  useUser,
  usePlayers,
  useRoom,
  watch,
  onMounted,
} from '#imports'
import { playerRepo } from '~/apis/player'
import { roomRepo } from '~/apis/room'
import { getCurrentInning } from '~/modules/getCurrentInning'
import { generateInningSequence } from '~/modules/generateInningSequence'

definePageMeta({
  middleware: ['check-auth'],
  validate: (route) => {
    if (typeof route.params.id !== 'string') return false
    return /^[a-zA-Z0-9]+$/.test(route.params.id)
  },
})

const route = useRoute()
const { loginedUser } = useUser()
const { users, subscribePlayers } = usePlayers()
const { room, subscribeRoomStatusAndPlayerIds } = useRoom()

const ALL_SKITTLES: readonly (readonly number[])[] = [
  [7, 9, 8],
  [5, 11, 12, 6],
  [3, 10, 4],
  [1, 2],
] as const

const userId = ref<string>('')
const roomId = ref<string>('')
const unsubscribeRoom = ref<Function | null>(null)
const unsubscribePlayers = ref<Function | null>(null)

const isWinLoseDialogOpen = ref<boolean>(false)
const isSecondHalfStarted = ref<boolean>(false)

const selectedSkittles = ref<number[]>([])
const firstSkittleRefs = ref<HTMLInputElement[] | null>(null)
const secondSkittleRefs = ref<HTMLInputElement[] | null>(null)
const thirdSkittleRefs = ref<HTMLInputElement[] | null>(null)
const fourthSkittleRefs = ref<HTMLInputElement[] | null>(null)

const skittlesCardRef = ref<HTMLDivElement | null>(null)
// NOTE: ◯px
const topPosition = ref<string>('')
const maxTop = ref<number>(0)
const maxBottom = ref<number>(0)
// NOTE: 要素内でのクリックした相対的なマウスの高さの位置
const mouseDownPositionOfSkittlesCard = ref<number>(0)

const isOverlayOpen = ref(true)
const timerId = ref<NodeJS.Timeout | null>(null)

const temporaryScore = computed<number>(() => {
  if (selectedSkittles.value.length === 1) return selectedSkittles.value[0]
  return selectedSkittles.value.length
})

const inningSequence = computed<number[]>(() => {
  const DEFAULT_INNING_SEQUENCE = [1, 2, 3, 4]
  if (!users.value || users.value.length < 1) return DEFAULT_INNING_SEQUENCE
  const currentInning = getCurrentInning(users.value.map((user) => user.scores))
  return generateInningSequence(currentInning)
})

const isMyTurn = computed<boolean>(
  () => userId.value === room.value.playerIds[0]
)

const selectSkittle = (
  inputElements: HTMLInputElement[] | null,
  index: number
) => {
  if (inputElements) {
    inputElements[index].click()
  }
}

const clickOK = async () => {
  const myUser = users.value?.find((user) => user.id === userId.value)
  if (!myUser) return

  const newScores = [...myUser.scores, temporaryScore.value]

  // scoreにスコアを反映し、失格の判定や合計点数の計算をまとめて行う
  await playerRepo.updateScore({
    roomId: roomId.value!,
    playerId: userId.value!,
    newScores,
  })
  const { data: elimination } = await playerRepo.updateElimination({
    roomId: roomId.value!,
    playerId: userId.value!,
  })
  if (elimination === null) return

  if (room.value.status === 'FIRST_HALF_STARTED') {
    await playerRepo.updateFirstHalfScore({
      roomId: roomId.value!,
      playerId: userId.value!,
      scores: newScores,
      elimination,
    })
  } else if (room.value.status === 'SECOND_HALF_STARTED') {
    await playerRepo.updateSecondHalfScore({
      roomId: roomId.value!,
      playerId: userId.value!,
      scores: newScores,
      elimination,
    })
  }

  // inputで入力された点数をリセット
  selectedSkittles.value = []
  isOverlayOpen.value = true
}

const isMouseEvent = (event: MouseEvent | TouchEvent): event is MouseEvent =>
  event.type === 'mousemove' || event.type === 'mousedown'

const mouseDown = (event: MouseEvent | TouchEvent) => {
  const pageY: number = isMouseEvent(event)
    ? event.clientY
    : event.changedTouches[0].clientY

  mouseDownPositionOfSkittlesCard.value =
    pageY - skittlesCardRef.value!.offsetTop

  if (isMouseEvent(event)) {
    document.body.addEventListener('mousemove', mouseMove, false)
  }
}

// マウスカーソルが動いたときに発火
const mouseMove = (event: MouseEvent | TouchEvent) => {
  const pageY: number = isMouseEvent(event)
    ? event.pageY
    : event.changedTouches[0].pageY

  // NOTE: 要素のtop位置を計算する
  const topPositionOfSkittlesCard =
    pageY - mouseDownPositionOfSkittlesCard.value

  if (topPositionOfSkittlesCard < maxTop.value) {
    // 最上部に到達したとき、最上部の位置に固定する
    topPosition.value = maxTop.value + 'px'
  } else if (topPositionOfSkittlesCard > maxBottom.value) {
    // 最下部に到達したとき、最下部の位置に固定する
    topPosition.value = maxBottom.value + 'px'
  } else {
    topPosition.value = topPositionOfSkittlesCard + 'px'
  }

  // マウスボタンが離されたとき、またはカーソルが外れたとき発火
  if (isMouseEvent(event)) {
    document.body.addEventListener('mouseup', mouseUp, false)
    document.body.addEventListener('mouseleave', mouseUp, false)
  }
}

// マウスボタンが上がったら発火
const mouseUp = () => {
  document.body.removeEventListener('mousemove', mouseMove, false)
  document.body.removeEventListener('mouseup', mouseUp, false)
}
// isOverlayOpenを解除する関数
const toggleOverlay = () => {
  if (timerId.value !== null) {
    clearTimeout(timerId.value)
  }
  if (!isMyTurn.value) return
  isOverlayOpen.value = false

  timerId.value = setTimeout(() => {
    isOverlayOpen.value = true
  }, 10000)
}

onMounted(() => {
  const pageHeight = window.document.documentElement.clientHeight
  maxTop.value = pageHeight * 0.5
  maxBottom.value = pageHeight * 0.8
})
onUnmounted(() => {
  if (unsubscribePlayers.value) {
    unsubscribePlayers.value()
  }
  if (unsubscribeRoom.value) {
    unsubscribeRoom.value()
  }
})

/**
 * init
 */
userId.value = loginedUser.value!.id
roomId.value = route.params.id as string

subscribePlayers(roomId.value).then(({ data }) => {
  unsubscribePlayers.value = data
})
subscribeRoomStatusAndPlayerIds(roomId.value).then(({ data }) => {
  unsubscribeRoom.value = data
})

watch(
  () => room.value.status,
  async (newStatus) => {
    switch (newStatus) {
      // 後半終了
      case 'SECOND_HALF_FINISHED':
        isWinLoseDialogOpen.value = true
        break

      // 後半開始
      case 'SECOND_HALF_STARTED':
        isWinLoseDialogOpen.value = false
        isSecondHalfStarted.value = true
        break

      // 前半終了
      case 'FIRST_HALF_FINISHED':
        isWinLoseDialogOpen.value = true
        await roomRepo.resetPlayerIds({
          roomId: roomId.value,
        })
        break
    }
  }
)
</script>

<template>
  <div
    class="position-relative overflow-hidden"
    @mousedown="toggleOverlay"
    @touchstart="toggleOverlay"
  >
    <v-app-bar flat>
      <v-app-bar-title v-if="room">
        {{ room.name }}
      </v-app-bar-title>
      <v-spacer />
      <h3 class="room-status mr-4 py-1 px-3">
        {{ isSecondHalfStarted ? '後半' : '前半' }}
      </h3>
    </v-app-bar>

    <v-main>
      <v-container class="px-0">
        <!-- NOTE: 最新のusersを表示する都合上v-ifで表示を切り替える -->
        <WinLoseDialog
          v-if="isWinLoseDialogOpen"
          :users="users"
          :is-started-second-half="isSecondHalfStarted"
        />

        <v-table class="mx-auto">
          <thead>
            <tr>
              <th class="name-header" />
              <th
                v-if="inningSequence[0] !== 1"
                class="inning-header text-center text-caption pa-1"
              >
                …
              </th>

              <th
                v-for="inning in inningSequence"
                :key="inning"
                class="inning-header text-center pa-1"
              >
                {{ inning }}
              </th>
              <th class="period-and-total text-center pa-1">
                {{ isSecondHalfStarted ? '後半' : '前半' }}
              </th>
              <th class="period-and-total text-center pa-1">合計</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <th
                class="name-data text-center text-caption py-1"
                :class="[user.id === room.playerIds[0] ? 'my-order' : '']"
              >
                <div class="player-icon-container mx-auto pl-4">
                  <span
                    v-if="user.elimination"
                    class="text-red font-weight-bold my-auto text-h6"
                  >
                    ✘
                  </span>

                  <v-avatar
                    v-if="user && user.iconImageUrl"
                    :image="user.iconImageUrl"
                    class="player-icon my-auto mr-2"
                  />
                  <v-icon
                    v-else
                    color="grey"
                    class="player-icon my-auto"
                    :icon="mdiAccountCircle"
                  />
                </div>
                {{ user.name }}
              </th>

              <td
                v-if="inningSequence[0] !== 1"
                class="inning-data text-caption text-center pa-1"
              >
                …
              </td>

              <td
                v-for="inning in inningSequence"
                :key="inning"
                class="inning-data text-center pa-1"
              >
                <span
                  v-show="user.scores[inning - 1] === 0"
                  class="text-red font-weight-bold"
                >
                  ✘
                </span>
                <span
                  v-show="user.scores[inning - 1] > 0"
                  class="font-weight-bold"
                >
                  {{ user.scores[inning - 1] }}
                </span>
              </td>

              <td class="period-and-total text-center pa-1">
                <span class="font-weight-bold">
                  {{
                    isSecondHalfStarted
                      ? user.secondHalfScore
                      : user.firstHalfScore
                  }}
                </span>
                <br />
                <span class="text-subtitle-2"> /50 </span>
              </td>

              <td class="period-and-total text-center pa-1">
                <span class="font-weight-bold"
                  >{{ user.firstHalfScore + user.secondHalfScore }}
                </span>
                <br />
                <span class="text-subtitle-2"> /100 </span>
              </td>
            </tr>
          </tbody>
        </v-table>

        <div
          id="skittles-card"
          ref="skittlesCardRef"
          :style="{
            top: topPosition,
          }"
        >
          <v-overlay
            :model-value="!isMyTurn"
            contained
            :persistent="!isMyTurn"
            z-index="1"
          />
          <div class="text-center pb-4">
            <v-btn
              size="large"
              color="white"
              :icon="mdiDrag"
              variant="text"
              style="z-index: 2"
              @mousedown="mouseDown"
              @touchstart="mouseDown"
              @touchmove="mouseMove"
            />
          </div>
          <div class="text-center">
            <p class="text-subtitle-1 text-sm-h6 text-white my-2">
              スコア：
              {{ temporaryScore }}
            </p>
            <v-btn
              :disabled="!isMyTurn"
              color="orange"
              rounded
              variant="flat"
              class="text-white mx-auto"
              @click="clickOK"
              >OK</v-btn
            >
          </div>
          <div class="pa-4">
            <v-col cols="12" class="pa-0">
              <div class="skittles">
                <button
                  v-for="(firstSkittle, index) in ALL_SKITTLES[0]"
                  :key="index"
                  class="skittle"
                  :class="{
                    'v-btn--disabled': !isMyTurn,
                  }"
                  @click="selectSkittle(firstSkittleRefs, index)"
                >
                  <input
                    ref="firstSkittleRefs"
                    v-model="selectedSkittles"
                    class="d-none"
                    type="checkbox"
                    :value="firstSkittle"
                  />
                  <div class="score">{{ firstSkittle }}</div>
                </button>
              </div>

              <div class="skittles">
                <button
                  v-for="(secondSkittle, index) in ALL_SKITTLES[1]"
                  :key="index"
                  class="skittle"
                  :class="{
                    'v-btn--disabled': !isMyTurn,
                  }"
                  @click="selectSkittle(secondSkittleRefs, index)"
                >
                  <input
                    ref="secondSkittleRefs"
                    v-model="selectedSkittles"
                    class="d-none"
                    type="checkbox"
                    :value="secondSkittle"
                  />
                  <div class="score">{{ secondSkittle }}</div>
                </button>
              </div>

              <div class="skittles">
                <button
                  v-for="(thirdSkittle, index) in ALL_SKITTLES[2]"
                  :key="index"
                  class="skittle"
                  :class="{
                    'v-btn--disabled': !isMyTurn,
                  }"
                  @click="selectSkittle(thirdSkittleRefs, index)"
                >
                  <input
                    ref="thirdSkittleRefs"
                    v-model="selectedSkittles"
                    class="d-none"
                    type="checkbox"
                    :value="thirdSkittle"
                  />
                  <div class="score">{{ thirdSkittle }}</div>
                </button>
              </div>

              <div class="skittles">
                <button
                  v-for="(fourthSkittle, index) in ALL_SKITTLES[3]"
                  :key="index"
                  class="skittle"
                  :class="{
                    'v-btn--disabled': !isMyTurn,
                  }"
                  @click="selectSkittle(fourthSkittleRefs, index)"
                >
                  <input
                    ref="fourthSkittleRefs"
                    v-model="selectedSkittles"
                    class="d-none"
                    type="checkbox"
                    :value="fourthSkittle"
                  />
                  <div class="score">{{ fourthSkittle }}</div>
                </button>
              </div>
            </v-col>
          </div>
        </div>

        <div id="alert">
          <v-alert
            :model-value="!isMyTurn && isOverlayOpen"
            type="info"
            color="white"
            location="center"
          >
            他のプレイヤーが入力中です
            <v-progress-linear color="black" height="6" stream rounded
          /></v-alert>
          <v-alert
            :model-value="isMyTurn && isOverlayOpen"
            type="warning"
            location="center"
          >
            あなたの番です
            <v-progress-linear color="#38512f" height="6" stream rounded
          /></v-alert>
        </div>
      </v-container>
    </v-main>
  </div>
</template>

<style lang="scss" scoped>
* {
  color: #38512f;
}
.v-btn--disabled {
  opacity: 0.3;
}
.v-app-bar,
.v-footer,
.v-footer .v-card {
  background-color: white;
}

.v-main {
  background-color: #f2e4cf;
  height: 100vh;
}

.v-table {
  margin-top: 30px;
  margin-bottom: 150px;
  max-width: 720px;
  background-color: rgb(254, 245, 231);
}

.skittle {
  height: 50px;
  width: 50px;
  /* border-radius: 50%;
  line-height: 50px;
  text-align: center;

  background: #fce2c9; */
  font-size: 30px;
  color: #301008;
  margin-left: 10px;
  margin-right: 10px;
}

.skittles {
  display: flex;
  justify-content: center;
  align-items: center;
}

.score {
  border-radius: 50%;
  line-height: 50px;
  text-align: center;
  background: #fce2c9;
  cursor: pointer;
  cursor: hand;
}

input:checked + div {
  opacity: 0.3;
}

.player-icon-container {
  position: relative;
  width: fit-content;
}

// 失格マーク
.player-icon-container span {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
}

.player-icon {
  border-radius: 50%;
  background-color: white;
  width: 10vw;
  max-width: 48px;
  height: 10vw;
  max-height: 48px;
}

.my-order {
  background: orange;
}

.room-status {
  border: 1px solid grey;
  border-radius: 10px;
}

.name-header,
.name-data {
  max-width: 64px;
}

.inning-header,
.inning-data,
.period-and-total {
  max-width: 10vw !important;
}
#skittles-card {
  user-select: none;
  position: absolute;
  background-color: rgb(56, 125, 57);
  border-radius: 50% 50% 0 0;
  height: 480px;
  width: 100%;
  max-width: 720px;
  left: 50%;
  transform: translateX(-50%);
  -webkit-transform: translateX(-50%);
  -ms-transform: translateX(-50%);
  // NOTE: AndroidChromeのPull-to-Refreshを無効化
  touch-action: pan-down;

  @media screen and (min-width: 600px) {
    border-radius: 50% / 100% 100% 0 0;
  }
}
#overlay {
  position: absolute;
  height: 480px;
  width: 100%;
  max-width: 720px;
}
#alert {
  position: absolute;
  width: 80%;
  max-width: 480px;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}
</style>
