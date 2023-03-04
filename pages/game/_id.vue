<template>
  <div class="bg-red">
    <v-app>
      <RoomHeader>
        <h1 v-if="getterStartSecondHalf" style="border: 1px solid white">
          後半
        </h1>
        <h1 v-else style="border: 1px solid white">前半</h1>
      </RoomHeader>

      <WinLoseDialog
        v-if="getterShowWLDialog"
        @close-dialog="closeDialog"
      ></WinLoseDialog>

      <!-- <WinnerDialog></WinnerDialog> -->
      <v-main>
        <v-simple-table class="table">
          <thead>
            <tr>
              <th>名前</th>
              <th v-if="judge">1回</th>
              <th v-else v-for="n in maxLength" :key="n">{{ n }}回</th>
              <th
                class="border"
                :class="[{ isActive: !getterStartSecondHalf }]"
              >
                前半
              </th>
              <th class="border" :class="[{ isActive: getterStartSecondHalf }]">
                後半
              </th>
              <th class="border">合計</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in getterRoom" :key="user.id">
              <th
                class="name"
                :class="[user.id === getterUsers[0] ? 'order' : '']"
              >
                <span class="icon">
                  <v-icon v-show="user.id === getterUsers[0]" color="red"
                    >mdi-arrow-right-bold-circle</v-icon
                  >
                  <v-icon v-if="user.elimination" color="red"
                    >mdi-close-thick</v-icon
                  >
                  <img class="image" :src="user.iconImageUrl" />
                </span>
                {{ user.name }}
              </th>

              <td
                v-show="!user.score.length < scoreLength"
                v-for="(userScore, index) in user.score"
                :key="index"
              >
                <span v-show="userScore === 0">
                  <v-icon color="red">mdi-close-thick</v-icon>
                </span>
                <span v-show="userScore > 0">
                  {{ userScore }}
                </span>
              </td>

              <td
                v-show="user.score.length < scoreLength"
                v-for="n in spaceNumber(user.score.length)"
                :key="`${user.id}-${n}`"
              >
                &nbsp;
              </td>

              <td class="border" v-if="getterStartSecondHalf">
                {{ user.firstHalfScore }}/50
              </td>
              <td
                class="border"
                :class="[{ isActive: getterStartSecondHalf }]"
                v-if="getterStartSecondHalf"
              >
                {{ user.totalScore }}/50
              </td>

              <td
                class="border"
                :class="[{ isActive: !getterStartSecondHalf }]"
                v-if="!getterStartSecondHalf"
              >
                {{ user.totalScore }}/50
              </td>
              <td class="border" v-if="!getterStartSecondHalf">
                {{ user.firstHalfScore }}/50
              </td>
              <td class="border">
                {{ user.firstHalfScore + user.totalScore }}
              </td>
            </tr>
          </tbody>
        </v-simple-table>
      </v-main>

      <v-dialog v-model="dialog" max-width="600px">
        <v-card color="#387d39" dark>
          <v-card-actions>
            <v-btn fab text color="white" @click="switchDialog">
              <v-icon>mdi-window-close</v-icon>
            </v-btn>

            <v-spacer></v-spacer>
            <v-btn color="orange" rounded @click="clickOK">OK</v-btn>
          </v-card-actions>

          <v-container class="container">
            <v-col cols="12" class="input">
              <div class="skittles">
                <div
                  class="skittle"
                  @click="selectFirstScores(index)"
                  v-for="(score, index) in allScores[0]"
                  :key="index"
                >
                  <input
                    style="display: none"
                    ref="firstScores"
                    type="checkbox"
                    v-model="selectScore"
                    :value="score"
                  />
                  <div class="score">{{ score }}</div>
                </div>
              </div>

              <div class="skittles">
                <div
                  class="skittle"
                  @click="selectSecondScores(index)"
                  v-for="(score, index) in allScores[1]"
                  :key="index"
                >
                  <input
                    style="display: none"
                    ref="secondScores"
                    type="checkbox"
                    v-model="selectScore"
                    :value="score"
                  />
                  <div class="score">{{ score }}</div>
                </div>
              </div>

              <div class="skittles">
                <div
                  class="skittle"
                  @click="selectThirdScores(index)"
                  v-for="(score, index) in allScores[2]"
                  :key="index"
                >
                  <input
                    style="display: none"
                    ref="thirdScores"
                    type="checkbox"
                    v-model="selectScore"
                    :value="score"
                  />
                  <div class="score">{{ score }}</div>
                </div>
              </div>

              <div class="skittles">
                <div
                  class="skittle"
                  @click="selectFourthScores(index)"
                  v-for="(score, index) in allScores[3]"
                  :key="index"
                >
                  <input
                    style="display: none"
                    ref="fourthScores"
                    type="checkbox"
                    v-model="selectScore"
                    :value="score"
                  />
                  <div class="score">{{ score }}</div>
                </div>
              </div>
            </v-col>
          </v-container>
          <v-card-title class="headline"> 点数：{{ score }} </v-card-title>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn icon @click="howToUse = !howToUse">
              <v-icon>{{
                howToUse ? 'mdi-chevron-up' : 'mdi-chevron-down'
              }}</v-icon>
            </v-btn>
          </v-card-actions>

          <v-expand-transition>
            <div v-show="howToUse">
              <v-divider></v-divider>
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

      <GameFooter>
        <OthersTurnDialog v-show="userId !== getterUsers[0]"></OthersTurnDialog>
        <YourTurnDialog v-show="userId === getterUsers[0]"></YourTurnDialog>
        <v-spacer></v-spacer>
        <v-btn
          color="blue"
          dark
          :disabled="userId !== getterUsers[0]"
          @click="switchDialog"
          fab
        >
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </GameFooter>
    </v-app>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { useNuxtApp } from '#app'
import { useGameStore } from '~/store/game'
import WinLoseDialog from '../../components/WinLoseDialog'
import RoomHeader from '../../components/RoomHeader'
import GameFooter from '../../components/GameFooter'
import YourTurnDialog from '../../components/YourTurnDialog'
import OthersTurnDialog from '../../components/OthersTurnDialog'
import WinnerDialog from '../../components/WinnerDialog'

export default {
  components: {
    WinLoseDialog,
    RoomHeader,
    GameFooter,
    YourTurnDialog,
    OthersTurnDialog,
    WinnerDialog,
  },
  async created() {
    const user = await useNuxtApp().$user
    this.userId = user.uid
    this.roomId = this.$route.params.id

    const store = useGameStore()
    this.unsubscribe = await store.subscribe({ roomId: this.roomId })
    this.unsubscribeRoom = await store.subscribeRoom({ roomId: this.roomId })
  },
  beforeRouteLeave() {
    this.unsubscribe()
    this.unsubscribeRoom()
  },
  data() {
    return {
      userId: null,
      roomId: null,
      unsubscribe: null,
      unsubscribeRoom: null,

      judge: true,
      howToUse: false,
      dialog: false,

      selectScore: [],
      allScores: [
        [7, 9, 8],
        [5, 11, 12, 6],
        [3, 10, 4],
        [1, 2],
      ],
    }
  },
  computed: {
    ...mapState(useGameStore, [
      'getterRoom',
      'getterUsers',
      'getterShowWLDialog',
      'getterStartSecondHalf',
    ]),
    score() {
      if (this.selectScore.length === 1) {
        return this.selectScore[0]
      } else {
        return this.selectScore.length
      }
    },
    maxLength() {
      if (!this.getterRoom) return 1
      const array = []
      for (let index = 0; index < this.getterRoom.length; index++) {
        array.push(this.getterRoom[index].score.length)
      }
      return Math.max.apply(null, array)
    },
    scoreLength() {
      if (this.judge) return 1
      return this.maxLength
    },
    spaceNumber() {
      return function (number) {
        if (this.maxLength - number < 1) {
          return 1
        } else {
          return this.maxLength - number
        }
      }
    },
  },
  methods: {
    switchDialog() {
      this.dialog = !this.dialog
    },
    closeDialog() {
      useGameStore().closeWLDialog()
    },
    selectFirstScores(index) {
      this.$refs.firstScores[index].click()
    },
    selectSecondScores(index) {
      this.$refs.secondScores[index].click()
    },
    selectThirdScores(index) {
      this.$refs.thirdScores[index].click()
    },
    selectFourthScores(index) {
      this.$refs.fourthScores[index].click()
    },
    async clickOK() {
      this.judge = false
      // this.dialog = false
      this.switchDialog()

      // scoreにスコアを反映し、失格の判定や合計点数の計算をまとめて行う
      await useGameStore().setScore({
        score: this.score,
        userId: this.userId,
        roomId: this.roomId,
        // TODO: 不要…？
        // userOrder: this.userOrder,
      })

      // inputで入力された点数をリセット
      this.selectScore = []
    },
  },
}
</script>

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
