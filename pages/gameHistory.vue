<script setup lang="ts">
import { mdiMedal } from '@mdi/js'
import { GameHistory } from '~/types/api'
import { definePageMeta, useUser, ref, useNuxtApp } from '#imports'
import { gameHistoryRepo } from '~/apis/gameHistory'
import { DATE_FORMAT } from '~/constants/dayjs'

definePageMeta({
  middleware: ['check-auth'],
})

const { $dayjs } = useNuxtApp()
const { loginedUser } = useUser()

const gameHistories = ref<GameHistory[]>([])

/**
 * init
 */
const userId = loginedUser.value!.id
const { data, success } = await gameHistoryRepo.get(userId)
if (success) {
  gameHistories.value = data
}
</script>

<template>
  <div>
    <MainHeader>
      <v-app-bar-title>ゲーム履歴</v-app-bar-title>
    </MainHeader>
    <v-main>
      <v-container>
        <h4>最大15件まで表示されます</h4>
        <v-row>
          <v-col
            v-for="(history, index) in gameHistories"
            :key="index"
            cols="12"
            md="6"
            lg="4"
            xl="3"
          >
            <v-card color="custard-yellow">
              <v-card-item class="pt-2 pb-0 px-2">
                <v-card-title class="text-subtitle-2">
                  {{ $dayjs(history.createdAt.toDate()).format(DATE_FORMAT) }}
                </v-card-title>
              </v-card-item>

              <v-card-text class="px-2 pb-2">
                <v-table>
                  <thead>
                    <tr>
                      <th />
                      <th class="period-and-total text-center px-1">前半</th>
                      <th class="period-and-total text-center px-1">後半</th>
                      <th
                        class="period-and-total text-center px-1 font-weight-bold"
                      >
                        合計
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr
                      v-for="user in history.users"
                      :key="`${index}-${user.id}`"
                    >
                      <th class="px-1">
                        <v-icon
                          v-if="
                            history.users[0].firstHalfScore +
                              history.users[0].secondHalfScore ===
                            user.firstHalfScore + user.secondHalfScore
                          "
                          color="orange"
                          class="position-absolute"
                          :icon="mdiMedal"
                        />
                        <span class="ml-6"> {{ user.name }}</span>
                      </th>

                      <td class="period-and-total text-center px-1">
                        {{ user.firstHalfScore }}
                      </td>
                      <td class="period-and-total text-center px-1">
                        {{ user.secondHalfScore }}
                      </td>

                      <td
                        class="period-and-total text-center px-1 font-weight-bold"
                      >
                        {{ user.firstHalfScore + user.secondHalfScore }}
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

<style scoped>
.v-main {
  background-color: rgb(var(--v-theme-warm-vanilla));
  min-height: 100vh;
}

.v-table {
  background-color: rgb(var(--v-theme-custard-yellow));
}

.period-and-total {
  max-width: 10vw !important;
}
</style>
