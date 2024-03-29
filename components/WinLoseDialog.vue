<script setup lang="ts">
import { useRoute, useRouter } from '#app'
import { mdiAccountCircle } from '@mdi/js'
import { Player } from '../types/api'
import { ref, useUser } from '#imports'
import { userRepo } from '~/apis/user'
import { playerRepo } from '~/apis/player'
import { roomRepo } from '~/apis/room'
import { gameHistoryRepo } from '~/apis/gameHistory'

interface Props {
  users: Player[]
  isStartedSecondHalf: boolean
}

const props = withDefaults(defineProps<Props>(), {
  users: () => [],
  isStartedSecondHalf: () => false,
})

const route = useRoute()
const router = useRouter()

const { loginedUser } = useUser()

const WLDialog = ref<boolean>(true)
const userId = ref<string>('')
const roomId = ref<string>('')

const startSecond = async () => {
  await playerRepo.updateToSecondHalf({
    roomId: roomId.value!,
  })

  // props.usersをtotalScoreを元にソートして、userIdの配列を作る
  const copiedUsers = [...props.users]
  const playerIds = copiedUsers
    .sort((a, b) => {
      return b.firstHalfScore - a.firstHalfScore
    })
    .map((user) => user.id)
  await roomRepo.updateToStartSecondHalf({
    roomId: roomId.value!,
    playerIds,
  })
}

const finish = async () => {
  await playerRepo.delete({
    roomId: roomId.value,
    playerId: userId.value,
  })

  if (userId.value === roomId.value) {
    await roomRepo.reset({
      roomId: roomId.value,
    })
    router.push(`/room/${roomId.value}`)
  } else {
    router.push('/rooms')
  }
}

const winners = ref<Player[]>([])
const result = ref<Player[]>([])

const getWinners = (users: Player[]): Player[] => {
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
    await userRepo.incrementStars({
      userId: userId.value,
    })
  }
  await gameHistoryRepo.create(userId.value, result.value)
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
                  <v-avatar
                    v-if="r && r.iconImageUrl"
                    :image="r.iconImageUrl"
                    class="user-icon my-auto"
                  />
                  <v-icon
                    v-else
                    color="grey"
                    class="user-icon my-auto"
                    :icon="mdiAccountCircle"
                  />
                  {{ r.name }}
                  <span />
                </th>
                <td>
                  {{ r.firstHalfScore }}
                </td>
                <td>
                  {{ r.secondHalfScore }}
                </td>
                <td>
                  {{ r.firstHalfScore + r.secondHalfScore }}
                </td>
              </tr>
            </tbody>

            <!-- 1stHalf終了時に表示 -->
            <tbody v-else>
              <tr v-for="r in result" :key="r.id">
                <th>
                  <v-avatar
                    v-if="r && r.iconImageUrl"
                    :image="r.iconImageUrl"
                    class="user-icon my-auto"
                  />
                  <v-icon
                    v-else
                    color="grey"
                    class="user-icon my-auto"
                    :icon="mdiAccountCircle"
                  />
                  {{ r.name }}
                  <span />
                </th>
                <td>{{ r.firstHalfScore }}</td>
                <td>0</td>
                <td>{{ r.firstHalfScore }}</td>
              </tr>
            </tbody>
          </v-table>
        </v-col>
      </v-container>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.user-icon {
  width: 15vw;
  max-width: 48px;
  height: 15vw;
  max-height: 48px;
  border-radius: 50%;
  background-color: white;
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
