import { useNuxtApp } from '#app'
import {
  ApiResponse,
  User,
  Player,
  RoomStatus,
  CreatePlayerInput,
} from '../types/api'
import { calculateScore } from '../modules/calculateScore'
import { roomRepo } from './room'

export const playerRepo = {
  /**
   * プレイヤーを作成する
   * @param player
   * @param roomId
   * @returns
   */
  create: async ({
    roomId,
    player,
  }: {
    roomId: string
    player: CreatePlayerInput
  }): Promise<ApiResponse<User | null>> => {
    const { $firestore } = useNuxtApp()

    try {
      await $firestore
        .collection('rooms')
        .doc(roomId)
        .collection('players')
        .doc(player.id)
        .set(player)

      return {
        data: player,
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
  /**
   * プレイヤーを削除する
   * @param roomId
   * @param playerId
   * @returns
   */
  delete: async ({
    roomId,
    playerId,
  }: {
    roomId: string
    playerId: string
  }) => {
    const { $firestore } = useNuxtApp()

    try {
      await $firestore
        .collection('rooms')
        .doc(roomId)
        .collection('players')
        .doc(playerId)
        .delete()

      return {
        data: playerId,
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
  /**
   * プレイヤーの順序を更新する
   * @param playerIds
   * @param roomId
   * @returns
   */
  updateOrder: async ({
    roomId,
    playerIds,
  }: {
    roomId: string
    playerIds: Array<string>
  }) => {
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
  /**
   * プレイヤーを失格にする
   * @param roomId
   * @param playerId
   * @returns
   */
  updateElimination: async ({
    roomId,
    playerId,
  }: {
    roomId: string
    playerId: string
  }) => {
    const { $firestore } = useNuxtApp()
    await roomRepo.removeFirstPlayerId({
      roomId,
    })

    try {
      const userDoc = await $firestore
        .collection('rooms')
        .doc(roomId)
        .collection('players')
        .doc(playerId)
        .get()

      const docData = userDoc.data() as Player
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
          .doc(playerId)
          .update({
            elimination: true,
          })
      } else {
        // 失格ではない場合にusersに追加し、ゲームを続行させる
        await roomRepo.addPlayerId({
          playerId,
          roomId,
        })
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
  /**
   * プレイヤーを後半に更新する
   * @param roomId
   * @returns
   */
  updateToSecondHalf: async ({ roomId }: { roomId: string }) => {
    const { $firestore } = useNuxtApp()
    try {
      const players = await $firestore
        .collection('rooms')
        .doc(roomId)
        .collection('players')
        .orderBy('firstHalfScore', 'desc')
        .get()
        .then((snapshot) => {
          const players: Player[] = []
          snapshot.forEach((doc) => {
            players.push({ ...doc.data(), id: doc.id } as Player)
          })
          return players
        })

      const promises = players.map(async (player) => {
        await $firestore
          .collection('rooms')
          .doc(roomId)
          .collection('players')
          .doc(player.id)
          .update({
            scores: [],
            elimination: false,
          })
      })

      await Promise.all(promises)

      return {
        data: players,
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
  /**
   * scoreにスコアを記録後、失格の判定や合計点の計算を実行
   * @param roomId
   * @param playerId
   * @param newScores
   * @returns
   */
  updateScore: async ({
    roomId,
    playerId,
    newScores,
  }: {
    roomId: string
    playerId: string
    newScores: number[]
  }) => {
    const { $firestore } = useNuxtApp()
    try {
      await $firestore
        .collection('rooms')
        .doc(roomId)
        .collection('players')
        .doc(playerId)
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
  /**
   * 前半のスコアを更新する
   * @param roomId
   * @param playerId
   * @param scores
   * @param elimination
   * @returns
   */
  updateFirstHalfScore: async ({
    roomId,
    playerId,
    scores,
    elimination,
  }: {
    roomId: string
    playerId: string
    scores: number[]
    elimination: boolean
  }) => {
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
        .doc(playerId)
        .update({
          firstHalfScore: newFirstScore,
        })

      // 50点に到達すれば、その時点で前半を終了させる
      if (newFirstScore === 50) {
        const status: RoomStatus = 'FIRST_HALF_FINISHED'
        await roomRepo.finishGame({
          roomId,
          status,
        })
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
  /**
   * 後半のスコアを更新する
   * @param roomId
   * @param playerId
   * @param scores
   * @param elimination
   * @returns
   */
  updateSecondHalfScore: async ({
    roomId,
    playerId,
    scores,
    elimination,
  }: {
    roomId: string
    playerId: string
    scores: number[]
    elimination: boolean
  }) => {
    const { $firestore } = useNuxtApp()
    try {
      // score配列を元にtotalScoresを計算
      const newSecondScore = elimination ? 0 : calculateScore(scores)
      await $firestore
        .collection('rooms')
        .doc(roomId)
        .collection('players')
        .doc(playerId)
        .update({
          secondHalfScore: newSecondScore,
        })

      // 50点に到達すれば、その時点で前半を終了させる
      if (newSecondScore === 50) {
        const status: RoomStatus = 'SECOND_HALF_FINISHED'
        await roomRepo.finishGame({
          roomId,
          status,
        })
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
}
