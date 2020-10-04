<template>
  <div>
    <h1>部屋</h1>
    <v-app>
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
                  :disabled="isChooseOrder"
                />
                <div class="d-flex flex-no-wrap">
                  <!-- <div class="order"> -->
                  <v-card-title>
                    <v-icon x-large
                      >mdi-numeric-{{ user.order + 1 }}-circle</v-icon
                    >
                  </v-card-title>
                  <!-- </div> -->

                  <img :src="user.iconImageUrl" class="icon" />
                  <v-card-title class="headline">
                    <span> {{ user.name }}（ </span>
                    <!-- <v-spacer></v-spacer> -->

                    <v-icon color="#FFA000">mdi-star</v-icon>
                    <span> ×{{ user.stars }}） </span>
                  </v-card-title>
                  <!-- 
                  <div v-for="item in orderedUsers" :key="item">
                    {{ item }}
                  </div> -->
                </div>
              </v-card>
            </v-col>
          </v-row>

          <h1>{{ room.length }}/4</h1>
        </v-card>
      </v-container>

      <div>
        <v-btn color="primary" to="/rooms">戻る</v-btn>
        <div v-if="isHost">
          <v-btn color="red" v-if="order" @click="changeOrder"
            >順番を選択</v-btn
          >
          <v-btn color="black" v-else @click="decideOrder" dark
            >順番を決定</v-btn
          >
          <v-btn color="blue" @click="start">スタート</v-btn>
        </div>
      </div>
    </v-app>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

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
    // this.user = await this.$user()
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
  data() {
    return {
      unsubscribe: null,
      unstart: null,
      roomId: null,
      orderedUsers: [],
      order: true,
      user: null,
      isChooseOrder: true,
      isHost: false,
    }
  },

  computed: {
    ...mapGetters('room', ['room']),
  },
  methods: {
    chooseOrder(index) {
      this.$refs.order[index].click()
    },
    changeOrder() {
      this.order = !this.order
      this.isChooseOrder = !this.isChooseOrder
      this.orderedUsers = []
    },
    async decideOrder() {
      // 全員を選んでいない場合return
      if (this.orderedUsers.length !== this.room.length) return

      this.order = !this.order
      this.isChooseOrder = !this.isChooseOrder

      await this.$store.dispatch('room/decideOrder', {
        order: this.orderedUsers,
        roomId: this.roomId,
      })
    },
    async start() {
      this.unsubscribe()
      await this.$store.dispatch('room/clear')
      await this.$store.dispatch('room/startGame', { roomId: this.roomId })
      // this.$router.push('/game')
      // await this.$game()
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
  /* padding-top: 10px; */
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
