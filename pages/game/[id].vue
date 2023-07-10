<script setup lang="ts">
import { useRoute } from '#app'
import {
  mdiPencil,
  mdiArrowRightBoldCircle,
  mdiChevronDown,
  mdiChevronUp,
  mdiCloseThick,
  mdiWindowClose,
  mdiAccountCircle,
} from '@mdi/js'
import {
  definePageMeta,
  ref,
  computed,
  onUnmounted,
  useUser,
  usePlayers,
  useRoom,
  watch,
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

const isHowToUseOpen = ref<boolean>(false)
const isSelectSkittlesDialogOpen = ref<boolean>(false)
const isWinLoseDialogOpen = ref<boolean>(false)
const isSecondHalfStarted = ref<boolean>(false)

const selectedSkittles = ref<number[]>([])
const firstSkittleRefs = ref<HTMLInputElement[] | null>(null)
const secondSkittleRefs = ref<HTMLInputElement[] | null>(null)
const thirdSkittleRefs = ref<HTMLInputElement[] | null>(null)
const fourthSkittleRefs = ref<HTMLInputElement[] | null>(null)

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

const selectSkittle = (
  inputElements: HTMLInputElement[] | null,
  index: number
) => {
  if (inputElements) {
    inputElements[index].click()
  }
}

const clickOK = async () => {
  isSelectSkittlesDialogOpen.value = false

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
}

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
  <div>
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

        <v-dialog v-model="isSelectSkittlesDialogOpen" max-width="600px">
          <v-card color="#387d39">
            <v-card-actions>
              <v-btn icon @click="isSelectSkittlesDialogOpen = false">
                <v-icon color="white" :icon="mdiWindowClose" />
              </v-btn>

              <v-spacer />
              <v-btn
                color="orange"
                rounded
                variant="flat"
                class="text-white"
                @click="clickOK"
                >OK</v-btn
              >
            </v-card-actions>

            <v-container class="container">
              <v-col cols="12" class="pa-0">
                <div class="skittles">
                  <div
                    v-for="(firstSkittle, index) in ALL_SKITTLES[0]"
                    :key="index"
                    class="skittle"
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
                  </div>
                </div>

                <div class="skittles">
                  <div
                    v-for="(secondSkittle, index) in ALL_SKITTLES[1]"
                    :key="index"
                    class="skittle"
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
                  </div>
                </div>

                <div class="skittles">
                  <div
                    v-for="(thirdSkittle, index) in ALL_SKITTLES[2]"
                    :key="index"
                    class="skittle"
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
                  </div>
                </div>

                <div class="skittles">
                  <div
                    v-for="(fourthSkittle, index) in ALL_SKITTLES[3]"
                    :key="index"
                    class="skittle"
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
                  </div>
                </div>
              </v-col>
            </v-container>
            <v-card-title class="text-h6 text-white">
              点数：{{ temporaryScore }}
            </v-card-title>
            <v-card-actions>
              <v-spacer />
              <v-btn icon @click="isHowToUseOpen = !isHowToUseOpen">
                <v-icon
                  color="white"
                  :icon="isHowToUseOpen ? mdiChevronUp : mdiChevronDown"
                />
              </v-btn>
            </v-card-actions>

            <v-expand-transition>
              <div v-show="isHowToUseOpen">
                <v-divider />
                <v-card-text>
                  <h3 class="text-white">＜使い方＞</h3>
                  <li class="text-white text-body-1">0本選択・・・0点</li>
                  <li class="text-white text-body-1">
                    1本選択・・・選択された数字が点数
                  </li>
                  <li class="text-white text-body-1">
                    複数本選択・・・選択された本数が点数
                  </li>
                </v-card-text>
              </div>
            </v-expand-transition>
          </v-card>
        </v-dialog>
      </v-container>
    </v-main>

    <v-footer app class="pa-0">
      <v-card width="100%">
        <v-card-actions>
          <v-spacer />
          <v-card v-show="userId !== room.playerIds[0]" variant="flat">
            <v-card-text class="py-3 font-weight-bold">
              他のプレイヤーが入力中です
              <v-progress-linear
                color="#38512f"
                height="6"
                indeterminate
                rounded
              />
            </v-card-text>
          </v-card>

          <v-card v-show="userId === room.playerIds[0]" variant="flat">
            <v-card-text class="py-1 px-2 font-weight-bold"
              >あなたの番です<br />
              スコアを入力してください
            </v-card-text>
          </v-card>

          <v-spacer />
          <v-btn
            color="#f2e4cf"
            variant="elevated"
            :disabled="userId !== room.playerIds[0]"
            icon
            @click="isSelectSkittlesDialogOpen = true"
          >
            <v-icon :icon="mdiPencil" color="#38512f" />
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-footer>
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
</style>
