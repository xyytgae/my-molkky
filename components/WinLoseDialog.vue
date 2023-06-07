<script setup lang="ts">
import { useRoute, useRouter } from '#app'
import { PlayingUser } from '../types/api'
import { ref, useUser } from '#imports'
import { waitingUsersRepo } from '~/apis/waitingUser'
import { waitingRoomRepo } from '~/apis/waitingRoom'
import { gameHistoryRepository } from '~/apis/gameHistory'

interface Props {
  users: PlayingUser[]
  isStartedSecondHalf: boolean
}

const props = withDefaults(defineProps<Props>(), {
  users: () => [],
  isStartedSecondHalf: () => false,
})

const route = useRoute()
const router = useRouter()

const { loginedUser } = useUser()
const { updateUsersToSecondHalf, incrementStars, deleteUser } = waitingUsersRepo
const { updateToStartSecondHalf, resetRoom } = waitingRoomRepo
const { create } = gameHistoryRepository

const WLDialog = ref<boolean>(true)
const userId = ref<string>('')
const roomId = ref<string>('')

const startSecond = async () => {
  await updateUsersToSecondHalf(roomId.value!)

  // props.usersをtotalScoreを元にソートして、userIdの配列を作る
  const copiedUsers = [...props.users]
  const playerIds = copiedUsers
    .sort((a, b) => {
      return b.totalScore - a.totalScore
    })
    .map((user) => user.id)
  await updateToStartSecondHalf(roomId.value!, playerIds)
}

const finish = async () => {
  await deleteUser(userId.value, roomId.value)

  if (userId.value === roomId.value) {
    await resetRoom(roomId.value)
    router.push(`/room/${roomId.value}`)
  } else {
    router.push('/rooms')
  }
}

const winners = ref<PlayingUser[]>([])
const result = ref<PlayingUser[]>([])

const getWinners = (users: PlayingUser[]): PlayingUser[] => {
  const sortedPlayers = users.sort(
    (a, b) =>
      b.firstHalfScore +
      b.secondHalfScore -
      (a.firstHalfScore + a.secondHalfScore)
  )
  const winnerScore =
    sortedPlayers[0].firstHalfScore + sortedPlayers[0].secondHalfScore
  return sortedPlayers.filter(
    (player) => player.firstHalfScore + player.secondHalfScore === winnerScore
  )
}

/**
 * init
 */
userId.value = loginedUser.value!.id
roomId.value = route.params.id as string
result.value = [...props.users]

if (props.isStartedSecondHalf) {
  winners.value = getWinners(result.value)
  const isWinner = winners.value.some((winner) => winner.id === userId.value)
  if (isWinner) {
    await incrementStars(userId.value)
  }
  await create(userId.value, result.value)
}
</script>

<template>
  <v-dialog v-model="WLDialog" persistent max-width="600px">
    <v-card color="primary">
      <v-card-actions>
        <!-- <v-btn fab text color="white" @click="$emit('close-dialog')">
          <v-icon>mdi-window-close</v-icon>
        </v-btn> -->

        <v-spacer />
        <v-btn
          v-if="!isStartedSecondHalf && userId === roomId"
          color="orange"
          class="text-white"
          rounded
          variant="elevated"
          @click="startSecond"
          >後半へ進む</v-btn
        >
        <v-btn
          v-if="isStartedSecondHalf"
          color="orange"
          class="text-white"
          rounded
          variant="elevated"
          @click="finish"
        >
          終了
        </v-btn>
      </v-card-actions>

      <v-container class="container">
        <v-card-title v-if="isStartedSecondHalf">
          <v-row>
            <v-col v-for="w in winners" :key="w.id" cols="12">
              Winner :
              {{ w.name }}
              <WinnerDialog v-if="w.id == userId" />
            </v-col>
          </v-row>
        </v-card-title>

        <v-col cols="12">
          <v-table>
            <thead>
              <tr>
                <th>名前</th>
                <th>前半</th>
                <th>後半</th>
                <th>合計</th>
              </tr>
            </thead>

            <!-- 2ndHalf終了時に表示 -->
            <tbody v-if="isStartedSecondHalf">
              <tr v-for="r in result" :key="r.id">
                <th>
                  <img class="image" :src="r.iconImageUrl" />
                  {{ r.name }}
                  <span />
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
                  <span />
                </th>
                <td>
                  {{ r.totalScore }}
                </td>
                <td>{{ r.firstHalfScore }}</td>
                <td>{{ r.totalScore }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-col>
      </v-container>
    </v-card>
  </v-dialog>
</template>

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
