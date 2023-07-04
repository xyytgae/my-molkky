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
import { getMaxSubArrayLength } from '~/modules/getMaxSubArrayLength'

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

const maxInning = computed<number>(() => {
  if (!users.value || users.value.length < 1) return 1
  const maxInning =
    getMaxSubArrayLength(users.value.map((user) => user.scores)) + 1
  return maxInning
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
    <RoomHeader :room="room">
      <h1 v-if="isSecondHalfStarted" class="room-status">後半</h1>
      <h1 v-else class="room-status">前半</h1>
    </RoomHeader>

    <v-main>
      <v-container fluid>
        <!-- NOTE: 最新のusersを表示する都合上v-ifで表示を切り替える -->
        <WinLoseDialog
          v-if="isWinLoseDialogOpen"
          :users="users"
          :is-started-second-half="isSecondHalfStarted"
        />

        <v-table class="table">
          <thead>
            <tr>
              <th>名前</th>
              <th v-for="n in maxInning" :key="n">{{ n }}回</th>
              <th class="border" :class="[{ isActive: !isSecondHalfStarted }]">
                前半
              </th>
              <th class="border" :class="[{ isActive: isSecondHalfStarted }]">
                後半
              </th>
              <th class="border">合計</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <th
                class="name"
                :class="[user.id === room.playerIds[0] ? 'order' : '']"
              >
                <span class="icon">
                  <v-icon
                    v-show="user.id === room.playerIds[0]"
                    color="red"
                    class="my-auto"
                    :icon="mdiArrowRightBoldCircle"
                  />
                  <v-icon
                    v-if="user.elimination"
                    color="red"
                    class="my-auto"
                    :icon="mdiCloseThick"
                  />

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
                </span>
                {{ user.name }}
              </th>

              <td v-for="(userScore, index) in user.scores" :key="index">
                <span v-show="userScore === 0">
                  <v-icon color="red" :icon="mdiCloseThick" />
                </span>
                <span v-show="userScore > 0">
                  {{ userScore }}
                </span>
              </td>

              <td
                v-for="n in maxInning - user.scores.length"
                v-show="user.scores.length < maxInning"
                :key="`${user.id}-${n}`"
              >
                &nbsp;
              </td>

              <td class="border" :class="[{ isActive: !isSecondHalfStarted }]">
                {{ user.firstHalfScore }}/50
              </td>
              <td class="border" :class="[{ isActive: isSecondHalfStarted }]">
                {{ user.secondHalfScore }}/50
              </td>

              <td class="border">
                {{ user.firstHalfScore + user.secondHalfScore }}
              </td>
            </tr>
          </tbody>
        </v-table>

        <v-dialog v-model="isSelectSkittlesDialogOpen" max-width="600px">
          <v-card color="#387d39" dark>
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
              <v-col cols="12" class="input">
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
                <v-card-text class="how-to-use">
                  <h3>＜使い方＞</h3>
                  <li>0本選択・・・0点</li>
                  <li>1本選択・・・選択された数字が点数</li>
                  <li>複数本選択・・・選択された本数が点数</li>
                </v-card-text>
              </div>
            </v-expand-transition>
          </v-card>
        </v-dialog>
      </v-container>
    </v-main>

    <v-footer app class="pa-0" color="primary">
      <v-card color="primary" width="100%">
        <v-card-actions>
          <v-spacer />
          <v-card v-show="userId !== room.playerIds[0]">
            <v-card-text class="py-3 font-weight-bold">
              他のプレイヤーが入力中です
              <v-progress-linear
                color="deep-purple accent-4"
                height="6"
                indeterminate
                rounded
              />
            </v-card-text>
          </v-card>

          <v-card v-show="userId === room.playerIds[0]">
            <v-card-text class="py-1 px-2 font-weight-bold"
              >あなたの番です。<br />
              右のボタンからスコアを入力してください
            </v-card-text>
          </v-card>

          <v-spacer />
          <v-btn
            variant="flat"
            :disabled="userId !== room.playerIds[0]"
            icon
            @click="isSelectSkittlesDialogOpen = true"
          >
            <v-icon :icon="mdiPencil" color="primary" />
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-footer>
  </div>
</template>

<style lang="scss" scoped>
.table {
  margin-top: 30px;
  margin-bottom: 150px;
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
  background: red;
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

.input {
  padding: 0;
}

.how-to-use {
  font-size: 15px;
  color: white;
}

.button {
  // color: blue;
  margin-left: auto;
}

.user-icon {
  width: 15vw;
  max-width: 48px;
  height: 15vw;
  max-height: 48px;
  border-radius: 50%;
  background-color: white;
}

.icon {
  display: flex;
  justify-content: flex-end;
}

.name {
  text-align: center !important;
  font-size: 15px !important;
  width: 100px;
}

.order {
  background: orange;
}

.isActive {
  background: rgba(128, 128, 128, 0.5);
}

.border {
  border: 1px solid grey;
}

.room-status {
  border: 1px solid white;
}
</style>
