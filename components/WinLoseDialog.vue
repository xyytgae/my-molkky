<template>
  <v-dialog v-model="WLDialog" max-width="600px">
    <v-card color="blue" dark>
      <v-card-actions>
        <v-btn fab text color="white" @click="$emit('close-dialog')">
          <v-icon>mdi-window-close</v-icon>
        </v-btn>

        <v-spacer></v-spacer>
        <v-btn
          v-if="!startSecondHalf && userId === roomId"
          color="orange"
          @click="startSecond"
          rounded
          >後半へ進む</v-btn
        >
        <v-btn v-if="startSecondHalf" color="orange" @click="finish" rounded>
          終了
        </v-btn>
      </v-card-actions>

      <v-container class="container">
        <v-card-title class="headline" v-if="startSecondHalf">
          <!-- <span>{{ winner[0].name }}</span> -->
          <span v-for="w in winner" :key="w.id">
            Winner :
            {{ w.name }}
          </span>
        </v-card-title>
        <!-- <v-card-title class="headline" v-for="w in winner" :key="w.id">
          1st Half Winner :
          {{ w.name }}
        </v-card-title> -->

        <v-col cols="12">
          <v-simple-table>
            <thead>
              <tr>
                <th>NAME</th>
                <th>1stHalf</th>
                <th>2ndHalf</th>
                <th>合計</th>
              </tr>
            </thead>

            <!-- 2ndHalf終了時に表示 -->
            <tbody v-if="startSecondHalf">
              <tr v-for="r in result" :key="r.id">
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
              <tr v-for="r in result" :key="r.id">
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
import { mapGetters } from 'vuex'

export default {
  async created() {
    const user = await this.$user()
    this.userId = user.uid
    const roomId = this.$route.params.id
    this.roomId = roomId

    if (this.startSecondHalf) {
      await this.$store.dispatch('result/getWinner', { 
        roomId,
        userId: this.userId
      })
    }

    await this.$store.dispatch('result/getResult', { 
      roomId, 
      userId: this.userId 
    })
    
    // await this.$store.dispatch('result/recordData', {
    //   userId: this.userId,
    // })
  },
  destroyed() {
    this.$store.dispatch('result/clear')
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

      await this.$store.dispatch('game/startSecondHalf', {
        roomId: this.roomId,
      })
    },
    async finish() {
      this.$store.dispatch('game/clear')
      
      await this.$store.dispatch('result/clearFirestore', {
        userId: this.userId,
        roomId: this.roomId
      })

      if (this.userId === this.roomId) {
        await this.$store.dispatch('result/resetRoom', {
          roomId: this.roomId,
        })
        this.$router.push(`/room/${this.roomId}`)
      } else {
        this.$router.push('/rooms')
      }
    },
  },
  computed: {
    ...mapGetters('result', ['result', 'winner']),
    ...mapGetters('game', ['startSecondHalf']),
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
