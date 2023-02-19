<template>
  <div>
    <v-app>
      <UserHeader></UserHeader>
      <v-main>
        <v-container>
          <h3>最大15件まで表示されます</h3>
          <v-row>
            <v-col
              cols="12"
              v-for="(createdAt, index) in getterGameHistoryCreatedAt"
              :key="index"
              class="card bg-blue"
            >
              <v-card :dark="index % 2 !== 0">
                <v-card-title>
                  <span>
                    {{ createdAt.createdAt.toDate().getFullYear() }}年
                  </span>
                  <span>
                    {{ createdAt.createdAt.toDate().getMonth() + 1 }}月
                  </span>
                  <span>
                    {{ createdAt.createdAt.toDate().getDate() }}日&ensp;
                  </span>
                  <span> {{ createdAt.createdAt.toDate().getHours() }}時</span>
                  <span>
                    {{ createdAt.createdAt.toDate().getMinutes() }}分</span
                  >
                </v-card-title>

                <v-card-text>
                  <v-simple-table>
                    <thead>
                      <tr>
                        <th>名前</th>
                        <th>前半</th>
                        <th>後半</th>
                        <th>合計</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr
                        v-for="user in getterGameHistoryUsers[index]"
                        :key="`${index}-${user.id}`"
                      >
                        <th>
                          <v-icon
                            v-if="
                              getterGameHistoryUsers[index][0].sum === user.sum
                            "
                            color="orange"
                            >mdi-medal</v-icon
                          >
                          {{ user.name }}
                        </th>

                        <td>
                          {{ user.firstHalfScore }}
                        </td>
                        <td>
                          {{ user.totalScore }}
                        </td>

                        <td>
                          {{ user.firstHalfScore + user.totalScore }}
                        </td>
                      </tr>
                    </tbody>
                  </v-simple-table>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-main>
    </v-app>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useNuxtApp } from '#app'
import { useMainStore } from '~/store/main'
import UserHeader from '~/components/UserHeader'

export default {
  methods: {
    ...mapActions(useMainStore, ['getGameHistory', 'clearGameHistory']),
  },
  async created() {
    const user = await useNuxtApp().$user
    const userId = user.uid

    await this.getGameHistory({ userId })
  },
  destroyed() {
    this.clearGameHistory()
  },
  components: {
    UserHeader,
  },
  computed: {
    ...mapState(useMainStore, [
      'getterGameHistoryCreatedAt',
      'getterGameHistoryUsers',
    ]),
  },
}
</script>
