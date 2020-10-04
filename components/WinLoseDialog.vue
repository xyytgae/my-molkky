<template>
  <v-dialog v-model="WLDialog" max-width="600px">
    <v-card color="blue" dark>
      <v-card-actions>
        <v-btn fab text color="white" @click="$emit('close-dialog')">
          <v-icon>mdi-window-close</v-icon>
        </v-btn>

        <v-spacer></v-spacer>
        <v-btn color="orange" rounded>後半へ進む</v-btn>
      </v-card-actions>

      <v-container class="container">
        <v-card-title class="headline" v-for="w in winner" :key="w.id">
          Winner :
          {{ w.name }}
        </v-card-title>
        <!-- <v-row> -->
        <v-col cols="12">
          <v-simple-table>
            <thead>
              <tr>
                <th>NAME</th>
                <th>合計</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in result" :key="r.id">
                <th>
                  <img class="image" :src="r.iconImageUrl" />
                  {{ r.name }}
                  <span> </span>
                </th>
                <td>
                  {{ r.totalScore }}
                </td>
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
    const roomId = this.$route.params.id

    await this.$store.dispatch('result/getResult', { roomId })
    await this.$store.dispatch('result/getWinner', { roomId })
  },
  data() {
    return {
      WLDialog: true,
    }
  },
  methods: {},
  computed: {
    ...mapGetters('result', ['result', 'winner']),
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
  /* align-content: center !important; */
}

th span {
  position: absolute;
  top: 40%;
}

tr {
}
</style>