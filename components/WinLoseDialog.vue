<template>
  <v-dialog v-model="WLDialog" persistent max-width="600px">
    <v-card color="blue" dark>
      <v-card-actions>
        <!-- <v-btn fab text color="white" @click="$emit('close-dialog')">
          <v-icon>mdi-window-close</v-icon>
        </v-btn> -->

        <v-spacer></v-spacer>
        <v-btn
          v-if="!getterStartSecondHalf && userId === roomId"
          color="orange"
          @click="startSecond"
          rounded
          >後半へ進む</v-btn
        >
        <v-btn
          v-if="getterStartSecondHalf"
          color="orange"
          @click="finish"
          rounded
        >
          終了
        </v-btn>
      </v-card-actions>

      <v-container class="container">
        <v-card-title class="headline" v-if="getterStartSecondHalf">
          <v-row>
            <v-col cols="12" v-for="w in getterWinner" :key="w.id">
              Winner :
              {{ w.name }}
              <WinnerDialog v-if="w.id == userId"></WinnerDialog>
            </v-col>
          </v-row>
        </v-card-title>

        <v-col cols="12">
          <v-simple-table>
            <thead>
              <tr>
                <th>名前</th>
                <th>前半</th>
                <th>後半</th>
                <th>合計</th>
              </tr>
            </thead>

            <!-- 2ndHalf終了時に表示 -->
            <tbody v-if="getterStartSecondHalf">
              <tr v-for="r in getterResult" :key="r.id">
                <th>
                  <img class="image" :src="r.iconImageUrl" />
                  {{ r.name }}
                  <span> </span>
                </th>
                <td>
                  {{ r.firstHalfScore }}
                </td>
                <td>
                  {{ r.totalScore }}
                </td>
                <td>
                  {{ r.firstHalfScore + r.totalScore }}
                </td>
              </tr>
            </tbody>

            <!-- 1stHalf終了時に表示 -->
            <tbody v-else>
              <tr v-for="r in getterResult" :key="r.id">
                <th>
                  <img class="image" :src="r.iconImageUrl" />
                  {{ r.name }}
                  <span> </span>
                </th>
                <td>
                  {{ r.totalScore }}
                </td>
                <td>{{ r.firstHalfScore }}</td>
                <td>{{ r.totalScore }}</td>
              </tr>
            </tbody>
          </v-simple-table>
        </v-col>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapState } from 'pinia'
import { useNuxtApp } from '#app'
import { useGameStore } from '~/store/game'
import { useResultStore } from '~/store/result'
import WinnerDialog from '../components/WinnerDialog'

export default {
  components: {
    WinnerDialog,
  },
  async created() {
    const resultStore = useResultStore()
    const user = await useNuxtApp().$user
    this.userId = user.uid
    const roomId = this.$route.params.id
    this.roomId = roomId
    await resultStore.getResult({
      roomId,
      userId: this.userId,
    })
    if (this.getterStartSecondHalf) {
      await resultStore.getWinner({
        roomId,
        userId: this.userId,
      })

      // await resultStore.recordData({
      //   userId: this.userId,
      // })
    }
  },
  destroyed() {
    useResultStore().clear()
  },
  data() {
    return {
      WLDialog: true,
      userId: null,
      roomId: null,
    }
  },
  methods: {
    async startSecond() {
      // this.$store.dispatch('game/clearUsers')

      await useGameStore().startSecondHalf({ roomId: this.roomId })
    },
    async finish() {
      useGameStore().clear()

      const resultStore = useResultStore()

      await resultStore.clearFirestore({
        userId: this.userId,
        roomId: this.roomId,
      })

      if (this.userId === this.roomId) {
        await resultStore.resetRoom({
          roomId: this.roomId,
        })
        this.$router.push(`/room/${this.roomId}`)
      } else {
        this.$router.push('/rooms')
      }
    },
  },
  computed: {
    ...mapState(useResultStore, ['getterResult', 'getterWinner']),
    ...mapState(useGameStore, ['getterStartSecondHalf']),
  },
}
</script>

<style scoped>
.image {
  width: 3rem;
  height: 3rem;
  border-radius: 30px;
}

th {
  position: relative;
  font-size: 15px !important;
  /* text-align: center; */
  /* padding-top: 5px !important;
  padding-bottom: 5px !important; */
  padding: 5px !important;
}

th span {
  position: absolute;
  top: 40%;
}

.container {
  padding: 0;
}
</style>
