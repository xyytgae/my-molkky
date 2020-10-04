<template>
  <div>
    <h1>開始{{ userOrder }}</h1>
    <!-- <p></p> -->

    <v-app>
      <div>
        <v-btn color="primary" @click="finish">END</v-btn>
        <v-btn @click="switchWinLose">WinLose</v-btn>
      </div>

      <WinLoseDialog
        v-if="showWLDialog"
        @close-dialog="closeDialog"
      ></WinLoseDialog>

      <v-simple-table>
        <thead>
          <tr>
            <th>NAME</th>
            <th v-if="judge">1回</th>
            <th v-else v-for="(n, index) in scoreLength" :key="index">
              {{ n }}回
            </th>
            <th>合計</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in room" :key="user.id">
            <th class="name" :class="[user.order === userOrder ? 'order' : '']">
              <span class="icon">
                <v-icon v-show="user.order === userOrder" color="red"
                  >mdi-arrow-right-bold-circle</v-icon
                >
                <img class="image" :src="user.iconImageUrl" />
              </span>
              {{ user.name }}
            </th>

            <td v-show="user.score.length < scoreLength">&nbsp;</td>

            <td
              v-show="!user.score.length < scoreLength"
              v-for="(score, index) in user.score"
              :key="index"
            >
              <span v-show="score === 0">
                <v-icon color="red">mdi-close-thick</v-icon>
              </span>
              <span v-show="score > 0">
                {{ score }}
              </span>
            </td>
            <!-- <td>0</td> -->
            <td>{{ user.totalScore }} / 50</td>
          </tr>
        </tbody>
      </v-simple-table>

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
            <!-- <v-row> -->
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
          <!-- </v-card-text> -->
          <v-card-title class="headline"> 点数：{{ choice }} </v-card-title>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn icon @click="show = !show">
              <v-icon>{{
                show ? 'mdi-chevron-up' : 'mdi-chevron-down'
              }}</v-icon>
            </v-btn>
          </v-card-actions>

          <v-expand-transition>
            <div v-show="show">
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
      <h1>{{ selectScore }}</h1>
      <div v-show="userOrder === order">
        <v-btn color="primary" @click="switchDialog" rounded
          >点数を入力する</v-btn
        >
      </div>
    </v-app>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import WinLoseDialog from '../../components/WinLoseDialog'

export default {
  components: {
    WinLoseDialog,
  },
  async asyncData({ store, params }) {
    const roomId = params.id
    // await store.dispatch('room/getUser', { roomId })

    const unsubscribe = await store.dispatch('room/subscribe', { roomId })
    const ungetUserOrder = await store.dispatch('room/getUserOrder', { roomId })
    // const unstart = await store.dispatch('room/start', { roomId })
    return {
      unsubscribe,
      ungetUserOrder,
      // unstart,
    }
  },
  async created() {
    const user = await this.$user()
    const userId = user.uid
    // this.order = user.order
    this.roomId = this.$route.params.id

    this.room.forEach((r) => {
      if (r.id === userId) {
        this.order = r.order
      }
    })

    // await this.$store.dispatch('room/getUser', { roomId: this.roomId })
    // await this.$store.dispatch('room/setScore', { userId, roomId: this.roomId })
  },
  async destroyed() {
    const user = await this.$user()
    const userId = user.uid

    // await this.$store.dispatch('room/clear', { userId, roomId: this.roomId })
    this.unsubscribe()
    // this.unstart()
  },
  data() {
    return {
      showWLDialog: false,
      order: 0,
      judge: true,
      show: false,
      unsubscribe: null,
      ungetUserOrder: null,
      // unstart: null,
      roomId: null,
      totalScore: 0,
      dialog: false,

      selectScore: [],
      // firstScores: [7, 9, 8],
      // secondScores: [5, 11, 12, 6],
      // thirdScores: [3, 10, 4],
      // fourthScores: [1, 2],
      scoresArray: [],
      allScores: [
        [7, 9, 8],
        [5, 11, 12, 6],
        [3, 10, 4],
        [1, 2],
      ],
    }
  },
  computed: {
    ...mapGetters('room', ['room', 'userOrder']),
    choice() {
      if (this.selectScore.length === 1) {
        return this.selectScore[0]
      } else {
        return this.selectScore.length
      }
    },
    scoreLength() {
      if (this.judge) return 1
      // if (this.room[0].score.length < 1) return 1
      return this.room[0].score.length
    },
  },
  methods: {
    switchDialog() {
      this.dialog = !this.dialog
    },
    switchWinLose() {
      // this.showWLDialog = !this.showWLDialog
      this.showWLDialog = true
    },
    closeDialog() {
      this.showWLDialog = false
    },
    // openDialog() {
    //   this.dialog = true
    // },
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
      const user = await this.$user()
      const userId = user.uid
      this.scoresArray.push(this.choice)
      this.selectScore = []
      this.totalScore = 0

      if (this.scoresArray.length >= 1) {
        this.scoresArray.forEach((s) => {
          this.totalScore += s
        })
      }
      if (this.totalScore > 50) {
        this.totalScore = 25
      }

      this.changeUserOrder()

      await this.$store.dispatch('room/inputScore', {
        totalScore: this.totalScore,
        score: this.scoresArray,
        userId,
        roomId: this.roomId,
      })
    },

    async changeUserOrder() {
      const order = (this.userOrder + 1) % this.room.length
      await this.$store.dispatch('room/changeUserOrder', {
        roomId: this.roomId,
        order,
      })
    },

    async finish() {
      // this.dialog = true
      this.switchDialog()
      // const roomId = this.$route.params.id
      // await this.$store.dispatch('room/finish', { roomId })
    },
  },
}
</script>

<style lang="scss" scoped>
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
  /* background: rgba(252, 226, 201, 0.3); */
  opacity: 0.3;
}

.input {
  padding: 0;
}

.how-to-use {
  /* padding-right: 0; */
  font-size: 15px;
}

.container {
  /* background: lightskyblue; */
  /* background: #93ca76; */
}

.image {
  width: 3rem;
  height: 3rem;
  border-radius: 30px;
}

// .v-data-table table thead th,
// .v-data-table table tbody th {
//   font-size: 20px !important;
//   background: red;
// }
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
</style>
