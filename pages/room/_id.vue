<template>
  <div>
    <h1>部屋</h1>
    <v-app>
      <RoomHeader></RoomHeader>

      <v-main>
        <v-container>
          <v-card class="card">
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

        <!-- <div>
          <v-btn color="primary" @click="moveToRoomsPage">戻る</v-btn>
          <div v-if="isHost">
            <v-btn color="red" v-if="order" @click="changeOrder"
              >順番を選択</v-btn
            >
            <v-btn color="black" v-else @click="decideOrder" dark
              >順番を決定</v-btn
            >
            <v-btn color="blue" @click="start">スタート</v-btn>
          </div>
        </div> -->
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

.card {
  background: skyblue;
}

input + div {
  /* color: red; */
  /* background: red; */
}

input:checked + div {
  background: lightgreen;
}
</style>
