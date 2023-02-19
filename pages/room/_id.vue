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
                    <v-card-text> 「順番を選択」を押してください </v-card-text>
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
              <v-col
                cols="12"
                v-for="(user, index) in getterRoom"
                :key="user.uid"
              >
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
                        <span style="color: #ffa000">★</span>×{{ user.stars }}
                      </div>
                    </v-card-title>
                  </div>
                </v-card>
              </v-col>
            </v-row>

            <h1>{{ getterRoom.length }}/4</h1>
          </v-card>
        </v-container>

        <DeleteRoomDialog
          v-if="dialog && isHost"
          @close-dialog="dialog = false"
          @delete-room="exit()"
        ></DeleteRoomDialog>
      </v-main>
      <RoomFooter v-if="isHost" @exit-room="exit()">
        <v-btn color="green" v-show="order" @click="changeOrder"
          >順番を選択</v-btn
        >
        <v-btn
          color="white"
          v-show="!order"
          :disabled="orderedUsers.length !== getterRoom.length"
          @click="decideOrder"
          >順番を決定</v-btn
        >
        <v-spacer></v-spacer>
        <v-btn :disabled="startButton" outlined @click="start">START</v-btn>
      </RoomFooter>

      <RoomFooter v-else @exit-room="exit()" />

      <!-- <DeleteRoomDialog v-if="isHost"></DeleteRoomDialog> -->
    </v-app>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useNuxtApp } from '#app'
import { useRoomStore } from '~/store/room'
import RoomHeader from '../../components/RoomHeader'
import RoomFooter from '../../components/RoomFooter'
import DeleteRoomDialog from '../../components/DeleteRoomDialog'

export default {
  middleware: ['checkAuth'],
  async asyncData({ params, $user }) {
    const roomId = params.id
    const user = await $user()
    const userId = user.uid

    const store = useRoomStore()

    const unsubscribe = await store.subscribe({ roomId })
    const unstart = await store.start({ userId, roomId })

    return {
      unsubscribe,
      unstart,
    }
  },
  async created() {
    const user = await useNuxtApp().$user
    this.userId = user.uid
    this.roomId = this.$route.params.id
    this.isHost = this.roomId === user.uid

    await useRoomStore().setUser({ user, roomId: this.roomId })
  },
  async beforeDestroy() {
    const user = await useNuxtApp().$user
    const userId = user.uid

    this.unsubscribe()
    this.unstart()
  },
  destroyed() {
    useRoomStore().clear()
  },

  data() {
    return {
      userId: null,
      unsubscribe: null,
      unstart: null,
      user: null,
      roomId: null,
      orderedUsers: [],
      order: true,
      disabledOrder: true,
      isHost: false,
      dialog: false,
      startButton: true,
      stepper: 1,
    }
  },

  components: {
    RoomHeader,
    RoomFooter,
    DeleteRoomDialog,
  },

  computed: {
    ...mapState(useRoomStore, ['getterRoom']),
  },
  methods: {
    ...mapActions(useRoomStore, ['exitRoom', 'deleteRoom']),
    async exit() {
      if (this.isHost && this.dialog) {
        await this.exitRoom({ userId: this.userId, roomId: this.roomId })
        await this.deleteRoom({ roomId: this.roomId })
        this.$router.push('/rooms')
      } else if (this.isHost) {
        this.dialog = true
      } else {
        this.$router.push('/rooms')
        await this.exitRoom({ userId: this.userId, roomId: this.roomId })
      }
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
      if (this.orderedUsers.length !== this.getterRoom.length) return

      this.order = !this.order
      this.disabledOrder = !this.disabledOrder

      await useRoomStore().decideOrder({
        users: this.orderedUsers,
        roomId: this.roomId,
      })

      this.startButton = false

      // v-stepperを進める
      this.stepper = 3
    },
    async start() {
      this.unsubscribe()
      // await this.$store.dispatch('room/clear')
      await useRoomStore().startGame({ roomId: this.roomId })
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
</style>
