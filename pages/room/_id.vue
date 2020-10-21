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
                    <v-card-text>
                      「順番を選択」を押してください
                    </v-card-text>
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
              <v-col cols="12" v-for="(user, index) in room" :key="user.uid">
                <v-card @click="chooseOrder(index)">
                  <input
                    ref="order"
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
                        <span style="color: #FFA000">★</span>×{{ user.stars }}
                      </div>
                    </v-card-title>
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <h1>{{ room.length }}/4</h1>
          </v-card>
        </v-container>
      </v-main>
      <RoomFooter v-if="isHost">
        <v-btn color="green" v-show="order" @click="changeOrder"
          >順番を選択</v-btn
        >
        <v-btn
          color="white"
          v-show="!order"
          :disabled="orderedUsers.length !== room.length"
          @click="decideOrder"
          >順番を決定</v-btn
        >
        <v-spacer></v-spacer>
        <v-btn :disabled="startButton" outlined @click="start">START</v-btn>
      </RoomFooter>

      <RoomFooter v-else />
    </v-app>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import RoomHeader from '../../components/RoomHeader'
import RoomFooter from '../../components/RoomFooter'

export default {
  middleware: ['checkAuth'],
  async asyncData({ store, params }) {
    const roomId = params.id
    const unsubscribe = await store.dispatch('room/subscribe', { roomId })
    const unstart = await store.dispatch('room/start', { roomId })

    return {
      unsubscribe,
      unstart,
    }
  },
  async created() {
    const user = await this.$user()
    this.roomId = this.$route.params.id
    this.isHost = this.roomId === user.uid

    await this.$store.dispatch('room/setUser', { user, roomId: this.roomId })
  },
  async destroyed() {
    const user = await this.$user()
    const userId = user.uid

    // await this.$store.dispatch('room/clear', { userId, roomId: this.roomId })
    // this.unsubscribe()
    this.unstart()
  },
  components: {
    RoomHeader,
    RoomFooter,
  },
  data() {
    return {
      unsubscribe: null,
      unstart: null,
      user: null,
      roomId: null,
      orderedUsers: [],
      order: true,
      disabledOrder: true,
      isHost: false,

      startButton: true,
      stepper: 1,
    }
  },

  computed: {
    ...mapGetters('room', ['room']),
  },
  methods: {
    async moveToRoomsPage() {
      const user = await this.$user()
      const userId = user.uid
      await this.$store.dispatch('room/clearFirestore', {
        userId,
        roomId: this.roomId,
      })
      this.$router.push('/rooms')
    },
    chooseOrder(index) {
      this.$refs.order[index].click()
    },
    changeOrder() {
      this.order = !this.order
      this.disabledOrder = !this.disabledOrder
      this.orderedUsers = []

      this.startButton = true

      // v-stepperを進める
      this.stepper = 2
    },
    async decideOrder() {
      // 全員を選んでいない場合return
      if (this.orderedUsers.length !== this.room.length) return

      this.order = !this.order
      this.disabledOrder = !this.disabledOrder

      await this.$store.dispatch('room/decideOrder', {
        users: this.orderedUsers,
        roomId: this.roomId,
      })

      this.startButton = false

      // v-stepperを進める
      this.stepper = 3
    },
    async start() {
      this.unsubscribe()
      await this.$store.dispatch('room/clear')
      await this.$store.dispatch('room/startGame', { roomId: this.roomId })
    },
  },
}
</script>

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

/* .card {
  margin: 25px auto 0;
} */
</style>
