<script setup lang="ts">
import { mdiMedal } from '@mdi/js'
import { GameHistory } from '~/types/api'
import { definePageMeta, useUser, ref } from '#imports'
import { gameHistoryRepository } from '~/apis/gameHistory'

definePageMeta({
  middleware: ['check-auth'],
})

const { loginedUser } = useUser()

const gameHistories = ref<GameHistory[]>([])

/**
 * init
 */
const userId = loginedUser.value!.id
const { data, success } = await gameHistoryRepository.get(userId)
if (success) {
  gameHistories.value = data
}
</script>

<template>
  <div>
    <UserHeader />
    <v-main>
      <v-container>
        <h3>最大15件まで表示されます</h3>
        <v-row>
          <v-col
            v-for="(history, index) in gameHistories"
            :key="index"
            cols="12"
            class="card"
          >
            <v-card :theme="index % 2 !== 0 ? 'dark' : ''">
              <v-card-title class="text-subtitle-1">
                <span> {{ history.createdAt.toDate().getFullYear() }}年 </span>
                <span> {{ history.createdAt.toDate().getMonth() + 1 }}月 </span>
                <span>
                  {{ history.createdAt.toDate().getDate() }}日&ensp;
                </span>
                <span> {{ history.createdAt.toDate().getHours() }}時</span>
                <span> {{ history.createdAt.toDate().getMinutes() }}分</span>
              </v-card-title>

              <v-card-text>
                <v-table>
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
                      v-for="user in history.users"
                      :key="`${index}-${user.id}`"
                    >
                      <th>
                        <v-icon
                          v-if="history.users[0].sum === user.sum"
                          color="orange"
                          :icon="mdiMedal"
                        />
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
                </v-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </div>
</template>
