import { useNuxtApp } from '#app'
import { ApiResponse, User, PlayingUser, RoomStatus } from '../types/api'
import { calculateScore } from '../modules/calculateScore'
import { waitingRoomRepo } from './room'
import { firestore } from 'firebase'

const createDefaultUser = (
  user: User,
  createdAt: firestore.FieldValue
): PlayingUser => ({
  scores: [],
  firstHalfScore: 0,
  elimination: false,
  order: 0,
  stars: user.stars,
  id: user.id,
  name: user.name,
  iconImageUrl: user.iconImageUrl,
  createdAt,
  secondHalfScore: 0,
})

export const waitingUsersRepo = {
  createUser: async (
    user: User,
    roomId: string
  ): Promise<ApiResponse<User | null>> => {
    const { $firestore, $firebase } = useNuxtApp()
    const createdAt = $firebase.firestore.FieldValue.serverTimestamp()
    const addedUser = createDefaultUser(user, createdAt)

    try {
      await $firestore
        .collection('rooms')
        .doc(roomId)
        .collection('players')
        .doc(user.id)
        .set(addedUser)

      return {
        data: user,
        success: true,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        success: false,
        error,
      }
    }
  },
  deleteUser: async (userId: string, roomId: string) => {
    const { $firestore } = useNuxtApp()

    try {
      await $firestore
        .collection('rooms')
        .doc(roomId)
        .collection('players')
        .doc(userId)
        .delete()

      return {
        data: userId,
        success: true,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        success: false,
        error,
      }
    }
  },

  updateOrder: async (playerIds: string[], roomId: string) => {
    const { $firestore } = useNuxtApp()

    try {
      const promises = playerIds.map(async (playerId, index) => {
        await $firestore
          .collection('rooms')
          .doc(roomId)
          .collection('players')
          .doc(playerId)
          .update({
            order: index,
          })
      })

      await Promise.all(promises)
      await $firestore.collection('rooms').doc(roomId).update({
        playerIds,
      })

      return {
        data: playerIds,
        success: true,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        success: false,
        error,
      }
    }
  },

  eliminateUser: async (roomId: string, userId: string) => {
    const { $firestore } = useNuxtApp()
    await waitingRoomRepo.shiftPlayerId(roomId)

    try {
      const userDoc = await $firestore
        .collection('rooms')
        .doc(roomId)
        .collection('players')
        .doc(userId)
        .get()

      const docData = userDoc.data() as PlayingUser
      const userScores = docData.scores
      const lastZeroIndex = userScores.lastIndexOf(0)

      const isToBeEliminated =
        userScores[lastZeroIndex - 1] === 0 &&
        userScores[lastZeroIndex - 2] === 0 &&
        lastZeroIndex !== -1

      if (isToBeEliminated) {
        await $firestore
          .collection('rooms')
          .doc(roomId)
          .collection('players')
          .doc(userId)
          .update({
            elimination: true,
          })
      } else {
        // 失格ではない場合にusersに追加し、ゲームを続行させる
        await waitingRoomRepo.pushPlayerId(userId, roomId)
      }

      const status: RoomStatus = 'SECOND_HALF_FINISHED'

      // 1人を除き、失格になればゲームを終了させる
      await $firestore
        .collection('rooms')
        .doc(roomId)
        .collection('players')
        .where('elimination', '==', false)
        .get()
        .then((snapshot) => {
          if (snapshot.size === 1) {
            $firestore.collection('rooms').doc(roomId).update({
              status,
              playerIds: [],
            })
          }
        })

      return {
        data: isToBeEliminated,
        success: true,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        success: false,
        error,
      }
    }
  },
  updateUsersToSecondHalf: async (roomId: string) => {
    const { $firestore } = useNuxtApp()
    try {
      const users = await $firestore
        .collection('rooms')
        .doc(roomId)
        .collection('players')
        .orderBy('firstHalfScore', 'desc')
        .get()
        .then((snapshot) => {
          const users: PlayingUser[] = []
          snapshot.forEach((doc) => {
            users.push({ ...doc.data(), id: doc.id } as PlayingUser)
          })
          return users
        })

      const promises = users.map(async (user) => {
        await $firestore
          .collection('rooms')
          .doc(roomId)
          .collection('players')
          .doc(user.id)
          .update({
            scores: [],
            elimination: false,
          })
      })

      await Promise.all(promises)

      return {
        data: users,
        success: true,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        success: false,
        error,
      }
    }
  },
  // scoreにスコアを記録後、失格の判定や合計点の計算を実行
  // updateScore: async (userId: string, roomId: string, newScores: number[]) => {
  setScore: async (roomId: string, userId: string, newScores: number[]) => {
    const { $firestore } = useNuxtApp()
    try {
      await $firestore
        .collection('rooms')
        .doc(roomId)
        .collection('players')
        .doc(userId)
        .update({
          scores: newScores,
        })

      return {
        data: newScores,
        success: true,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        success: false,
        error,
      }
    }
  },

  updateFirstHalfScore: async (
    roomId: string,
    userId: string,
    scores: number[],
    elimination: boolean
  ) => {
    const { $firestore } = useNuxtApp()
    // const { scores, elimination } = user
    // user.elimination = false
    try {
      // score配列を元にtotalScoresを計算
      const newFirstScore = elimination ? 0 : calculateScore(scores)
      await $firestore
        .collection('rooms')
        .doc(roomId)
        .collection('players')
        .doc(userId)
        .update({
          firstHalfScore: newFirstScore,
        })

      // 50点に到達すれば、その時点で前半を終了させる
      if (newFirstScore === 50) {
        const status: RoomStatus = 'FIRST_HALF_FINISHED'
        await waitingRoomRepo.finishGame(roomId, status)
      }

      return {
        data: newFirstScore,
        success: true,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        success: false,
        error,
      }
    }
  },
  updateSecondHalfScore: async (
    roomId: string,
    userId: string,
    scores: number[],
    elimination: boolean
  ) => {
    const { $firestore } = useNuxtApp()
    try {
      // score配列を元にtotalScoresを計算
      const newSecondScore = elimination ? 0 : calculateScore(scores)
      await $firestore
        .collection('rooms')
        .doc(roomId)
        .collection('players')
        .doc(userId)
        .update({
          secondHalfScore: newSecondScore,
        })

      // 50点に到達すれば、その時点で前半を終了させる
      if (newSecondScore === 50) {
        const status: RoomStatus = 'SECOND_HALF_FINISHED'
        await waitingRoomRepo.finishGame(roomId, status)
      }

      return {
        data: newSecondScore,
        success: true,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        success: false,
        error,
      }
    }
  },
  incrementStars: async (userId: string) => {
    const { $firestore, $firebase } = useNuxtApp()
    try {
      await $firestore
        .collection('users')
        .doc(userId)
        .update({
          stars: $firebase.firestore.FieldValue.increment(1),
          // stones: $firebase.firestore.FieldValue.increment(1),
        })

      return {
        data: null,
        success: true,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        success: false,
        error,
      }
    }
  },
}
