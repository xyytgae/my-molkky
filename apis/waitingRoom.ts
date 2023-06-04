import { useNuxtApp } from '#app'
import { ApiResponse, Room } from '../types/api'

export const waitingRoomRepo = {
  updateToStartFirstHalf: async (
    roomId: string
  ): Promise<ApiResponse<string | null>> => {
    const { $firestore } = useNuxtApp()
    try {
      await $firestore.collection('rooms').doc(roomId).update({
        // gameStart: true,
        startFirstHalf: true,
      })

      return {
        data: roomId,
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
  updateToStartSecondHalf: async (
    roomId: string,
    playerIds: string[]
  ): Promise<ApiResponse<string | null>> => {
    const { $firestore } = useNuxtApp()
    try {
      await $firestore.collection('rooms').doc(roomId).update({
        startSecondHalf: true,
        finishSecondHalf: false,
        playerIds,
        // finishFirstHalf: false,
      })

      return {
        data: roomId,
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

  deleteRoom: async (roomId: string): Promise<ApiResponse<string | null>> => {
    const { $firestore } = useNuxtApp()

    try {
      await $firestore.collection('rooms').doc(roomId).update({
        delete: true,
      })
      await $firestore.collection('rooms').doc(roomId).delete()

      return {
        data: roomId,
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
   * 前半終了後に順番を表すusersをリセットする
   * @param roomId
   * @returns
   */
  // resetPlayerIds: async (roomId: string): Promise<ApiResponse<string | null>> => {
  clearPlayerIds: async (
    roomId: string
  ): Promise<ApiResponse<string | null>> => {
    const { $firestore } = useNuxtApp()

    try {
      await $firestore.collection('rooms').doc(roomId).update({
        playerIds: [],
      })

      return {
        data: roomId,
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
   * 自分のidをplayerIdsにpushし、自分の順番が再度戻ってくるようにする
   * 失格している場合は実行されない
   * @param playerId
   * @param roomId
   * @returns
   */
  // addPlayerIdId: async (
  pushPlayerId: async (
    playerId: string,
    roomId: string
  ): Promise<ApiResponse<Room['playerIds']>> => {
    const { $firestore } = useNuxtApp()
    try {
      const roomDoc = await $firestore.collection('rooms').doc(roomId).get()
      const { playerIds } = roomDoc.data() as Room
      const newPlayerIds = [...playerIds, playerId]

      await $firestore.collection('rooms').doc(roomId).update({
        playerIds: newPlayerIds,
      })

      return {
        data: newPlayerIds,
        success: true,
        error: null,
      }
    } catch (error) {
      return {
        data: [],
        success: false,
        error,
      }
    }
  },
  /**
   * users配列の先頭を消去し、次のユーザーに順番が回ってくるようにする
   * @param roomId
   * @returns
   */
  // removeFirstPlayerIdId: async (
  shiftPlayerId: async (
    roomId: string
  ): Promise<ApiResponse<Room['playerIds']>> => {
    const { $firestore } = useNuxtApp()
    try {
      const roomDoc = await $firestore.collection('rooms').doc(roomId).get()
      const { playerIds } = roomDoc.data() as Room
      const newPlayerIds = [...playerIds]
      newPlayerIds.shift()
      await $firestore.collection('rooms').doc(roomId).update({
        playerIds: newPlayerIds,
      })

      return {
        data: newPlayerIds,
        success: true,
        error: null,
      }
    } catch (error) {
      return {
        data: [],
        success: false,
        error,
      }
    }
  },
  // ゲームを終了させる
  finishGame: async (roomId: string): Promise<ApiResponse<string | null>> => {
    const { $firestore } = useNuxtApp()
    try {
      await $firestore.collection('rooms').doc(roomId).update({
        finishFirstHalf: true,
        finishSecondHalf: true,
        playerIds: [],
      })

      return {
        data: roomId,
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

  resetRoom: async (roomId: string): Promise<ApiResponse<string | null>> => {
    const { $firestore } = useNuxtApp()
    try {
      await $firestore.collection('rooms').doc(roomId).update({
        startFirstHalf: false,
        startSecondHalf: false,
        finishFirstHalf: false,
        finishSecondHalf: false,
        playerIds: [],
      })

      return {
        data: roomId,
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
