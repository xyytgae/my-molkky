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
    userIds: string[]
  ): Promise<ApiResponse<string | null>> => {
    const { $firestore } = useNuxtApp()
    try {
      await $firestore.collection('rooms').doc(roomId).update({
        startSecondHalf: true,
        finishSecondHalf: false,
        users: userIds,
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
  // resetUserIds: async (roomId: string): Promise<ApiResponse<string | null>> => {
  clearUsers: async (roomId: string): Promise<ApiResponse<string | null>> => {
    const { $firestore } = useNuxtApp()

    try {
      await $firestore.collection('rooms').doc(roomId).update({
        users: [],
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
   * 自分のidをusersにpushし、自分の順番が再度戻ってくるようにする
   * 失格している場合は実行されない
   * @param userId
   * @param roomId
   * @returns
   */
  // addUserId: async (
  pushUser: async (
    userId: string,
    roomId: string
  ): Promise<ApiResponse<Room['users']>> => {
    const { $firestore } = useNuxtApp()
    try {
      const roomDoc = await $firestore.collection('rooms').doc(roomId).get()
      const { users } = roomDoc.data() as Room
      const newUsers = [...users, userId]

      await $firestore.collection('rooms').doc(roomId).update({
        users: newUsers,
      })

      return {
        data: newUsers,
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
   * @param userIds
   * @returns
   */
  // removeFirstUserId: async (
  shiftUser: async (roomId: string): Promise<ApiResponse<Room['users']>> => {
    const { $firestore } = useNuxtApp()
    try {
      const roomDoc = await $firestore.collection('rooms').doc(roomId).get()
      const { users } = roomDoc.data() as Room
      const newUserIds = [...users]
      newUserIds.shift()
      await $firestore.collection('rooms').doc(roomId).update({
        users: newUserIds,
      })

      return {
        data: newUserIds,
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
        users: [],
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
        users: [],
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
