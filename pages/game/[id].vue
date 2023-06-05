<script setup lang="ts">
import { useRoute } from '#app'
import {
  mdiPencil,
  mdiArrowRightBoldCircle,
  mdiChevronDown,
  mdiChevronUp,
  mdiCloseThick,
  mdiWindowClose,
} from '@mdi/js'
import {
  definePageMeta,
  ref,
  computed,
  onUnmounted,
  useUser,
  useWaitingUsers,
  useWaitingRoom,
  watch,
} from '#imports'
import { waitingUsersRepo } from '~/apis/waitingUser'
import { waitingRoomRepo } from '~/apis/waitingRoom'
import { PlayingUser } from '~~/types/api'

definePageMeta({
  middleware: ['check-auth'],
  validate: (route) => {
    if (typeof route.params.id !== 'string') return false
    return /^[a-zA-Z0-9]+$/.test(route.params.id)
  },
})

const route = useRoute()
const { loginedUser } = useUser()
const { users, subscribeUsers } = useWaitingUsers()
const { room, subscribeRoomStatusAndPlayerIds } = useWaitingRoom()
const { setScore, eliminateUser, updateTotalScore } = waitingUsersRepo
const { clearPlayerIds } = waitingRoomRepo

const userId = ref<string>('')
const roomId = ref<string>('')
const unsubscribeRoom = ref<Function | null>(null)
const unsubscribeUsers = ref<Function | null>(null)

const judge = ref<boolean>(true)
const howToUse = ref<boolean>(false)
const dialog = ref<boolean>(false)

const selectScore = ref<number[]>([])
const allScores = ref<number[][]>([
  [7, 9, 8],
  [5, 11, 12, 6],
  [3, 10, 4],
  [1, 2],
])

const firstScores = ref<HTMLInputElement[] | null>(null)
const secondScores = ref<HTMLInputElement[] | null>(null)
const thirdScores = ref<HTMLInputElement[] | null>(null)
const fourthScores = ref<HTMLInputElement[] | null>(null)

const isShowWinLoseDialog = ref<boolean>(false)
const isStartedSecondHalf = ref<boolean>(false)

const score = computed<number>(() => {
  if (selectScore.value.length === 1) {
    return selectScore.value[0]
  } else {
    return selectScore.value.length
  }
})

const maxLength = computed<number>(() => {
  if (!users.value || users.value.length < 1) return 1
  const array = []
  for (let index = 0; index < users.value.length; index++) {
    array.push(users.value[index].score.length)
  }
  return Math.max.apply(null, array)
})

const scoreLength = computed<number>(() => {
  if (judge.value) return 1
  return maxLength.value
})

const spaceNumber = computed<(number: number) => number>(
  () => (number: number) => {
    if (maxLength.value - number < 1) {
      return 1
    } else {
      return maxLength.value - number
    }
  }
)

const switchDialog = () => {
  dialog.value = !dialog.value
}

const closeDialog = () => {
  isShowWinLoseDialog.value = false
}
const selectFirstScores = (index: number) => {
  if (firstScores.value) {
    firstScores.value[index].click()
  }
}
const selectSecondScores = (index: number) => {
  if (secondScores.value) {
    secondScores.value[index].click()
  }
}
const selectThirdScores = (index: number) => {
  if (thirdScores.value) {
    thirdScores.value[index].click()
  }
}
const selectFourthScores = (index: number) => {
  if (fourthScores.value) {
    fourthScores.value[index].click()
  }
}

const myScores = computed<number[]>(() => {
  if (!users) return []
  const myScores = users.value.find((user) => user.id === userId.value)?.score
  if (!myScores) return []
  return myScores
})

const myUser = computed<PlayingUser | null>(() => {
  if (!users) return null
  const myUser = users.value.find((user) => user.id === userId.value)
  if (!myUser) return null
  return myUser
})

const clickOK = async () => {
  judge.value = false
  // this.dialog = false
  switchDialog()

  const newScores = [...myScores.value, score.value]

  // scoreにスコアを反映し、失格の判定や合計点数の計算をまとめて行う
  await setScore(roomId.value!, userId.value!, newScores)
  await eliminateUser(roomId.value!, userId.value!)
  await updateTotalScore(roomId.value!, userId.value!, myUser.value!)

  // inputで入力された点数をリセット
  selectScore.value = []
}

onUnmounted(() => {
  if (unsubscribeUsers.value) {
    unsubscribeUsers.value()
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

subscribeUsers(roomId.value).then(({ data }) => {
  unsubscribeUsers.value = data
})
subscribeRoomStatusAndPlayerIds(roomId.value).then(({ data }) => {
  unsubscribeRoom.value = data
})

watch(
  () => room.value.finishSecondHalf,
  (newValue) => {
    if (newValue) {
      isShowWinLoseDialog.value = true
    }
  }
)

watch(
  () => room.value.startSecondHalf,
  (newValue) => {
    if (newValue) {
      isShowWinLoseDialog.value = false
      isStartedSecondHalf.value = true
    }
  }
)

watch(
  () => room.value.finishFirstHalf,
  async (newValue) => {
    if (newValue) {
      isShowWinLoseDialog.value = true
      await clearPlayerIds(roomId.value)
    }
  }
)
</script>

<template>
  <div>
    <RoomHeader :room="room">
      <h1 v-if="isStartedSecondHalf" style="border: 1px solid white">後半</h1>
      <h1 v-else style="border: 1px solid white">前半</h1>
    </RoomHeader>

    <!-- <WinnerDialog></WinnerDialog> -->
    <v-main>
      <v-container fluid>
        <WinLoseDialog
          v-if="isShowWinLoseDialog"
          :users="users"
          :is-started-second-half="isStartedSecondHalf"
          @close-dialog="closeDialog"
        />

        <v-table class="table">
          <thead>
            <tr>
              <th>名前</th>
              <th v-if="judge">1回</th>
              <th v-for="n in maxLength" v-else :key="n">{{ n }}回</th>
              <th class="border" :class="[{ isActive: !isStartedSecondHalf }]">
                前半
              </th>
              <th class="border" :class="[{ isActive: isStartedSecondHalf }]">
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
                  <img class="image" :src="user.iconImageUrl" />
                </span>
                {{ user.name }}
              </th>

              <td v-for="(userScore, index) in user.score" :key="index">
                <span v-show="userScore === 0">
                  <v-icon color="red" :icon="mdiCloseThick" />
                </span>
                <span v-show="userScore > 0">
                  {{ userScore }}
                </span>
              </td>

              <td
                v-for="n in spaceNumber(user.score.length)"
                v-show="user.score.length < scoreLength"
                :key="`${user.id}-${n}`"
              >
                &nbsp;
              </td>

              <td v-if="isStartedSecondHalf" class="border">
                {{ user.firstHalfScore }}/50
              </td>
              <td
                v-if="isStartedSecondHalf"
                class="border"
                :class="[{ isActive: isStartedSecondHalf }]"
              >
                {{ user.totalScore }}/50
              </td>

              <td
                v-if="!isStartedSecondHalf"
                class="border"
                :class="[{ isActive: !isStartedSecondHalf }]"
              >
                {{ user.totalScore }}/50
              </td>
              <td v-if="!isStartedSecondHalf" class="border">
                {{ user.firstHalfScore }}/50
              </td>
              <td class="border">
                {{ user.firstHalfScore + user.totalScore }}
              </td>
            </tr>
          </tbody>
        </v-table>

        <v-dialog v-model="dialog" max-width="600px">
          <v-card color="#387d39" dark>
            <v-card-actions>
              <v-btn icon @click="switchDialog">
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
                    v-for="(firstScore, index) in allScores[0]"
                    :key="index"
                    class="skittle"
                    @click="selectFirstScores(index)"
                  >
                    <input
                      ref="firstScores"
                      v-model="selectScore"
                      style="display: none"
                      type="checkbox"
                      :value="firstScore"
                    />
                    <div class="score">{{ firstScore }}</div>
                  </div>
                </div>

                <div class="skittles">
                  <div
                    v-for="(secondScore, index) in allScores[1]"
                    :key="index"
                    class="skittle"
                    @click="selectSecondScores(index)"
                  >
                    <input
                      ref="secondScores"
                      v-model="selectScore"
                      style="display: none"
                      type="checkbox"
                      :value="secondScore"
                    />
                    <div class="score">{{ secondScore }}</div>
                  </div>
                </div>

                <div class="skittles">
                  <div
                    v-for="(thirdScore, index) in allScores[2]"
                    :key="index"
                    class="skittle"
                    @click="selectThirdScores(index)"
                  >
                    <input
                      ref="thirdScores"
                      v-model="selectScore"
                      style="display: none"
                      type="checkbox"
                      :value="thirdScore"
                    />
                    <div class="score">{{ thirdScore }}</div>
                  </div>
                </div>

                <div class="skittles">
                  <div
                    v-for="(fourthScore, index) in allScores[3]"
                    :key="index"
                    class="skittle"
                    @click="selectFourthScores(index)"
                  >
                    <input
                      ref="fourthScores"
                      v-model="selectScore"
                      style="display: none"
                      type="checkbox"
                      :value="fourthScore"
                    />
                    <div class="score">{{ fourthScore }}</div>
                  </div>
                </div>
              </v-col>
            </v-container>
            <v-card-title class="text-h6 text-white">
              点数：{{ score }}
            </v-card-title>
            <v-card-actions>
              <v-spacer />
              <v-btn icon @click="howToUse = !howToUse">
                <v-icon
                  color="white"
                  :icon="howToUse ? mdiChevronUp : mdiChevronDown"
                />
              </v-btn>
            </v-card-actions>

            <v-expand-transition>
              <div v-show="howToUse">
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

    <GameFooter>
      <OthersTurnDialog v-show="userId !== room.playerIds[0]" />
      <YourTurnDialog v-show="userId === room.playerIds[0]" />
      <v-spacer />
      <v-btn
        variant="flat"
        :disabled="userId !== room.playerIds[0]"
        icon
        @click="switchDialog"
      >
        <v-icon :icon="mdiPencil" color="primary" />
      </v-btn>
    </GameFooter>
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

.image {
  width: 3rem;
  height: 3rem;
  border-radius: 30px;
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
</style>
