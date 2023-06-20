import { useNuxtApp } from '#app'
import { ApiResponse, Room, RoomStatus, CreateRoomInput } from '../types/api'

export const roomRepo = {
  /**
   * ルームを前半に更新する
   * @param roomId
   * @returns
   */
  updateToStartFirstHalf: async ({
    roomId,
  }: {
    roomId: string
  }): Promise<ApiResponse<string | null>> => {
    const { $firestore } = useNuxtApp()
    const status: RoomStatus = 'FIRST_HALF_STARTED'
    try {
      await $firestore.collection('rooms').doc(roomId).update({
        status,
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
   * ルームを後半に更新する
   * @param roomId
   * @param playerIds
   * @returns
   */
  updateToStartSecondHalf: async ({
    roomId,
    playerIds,
  }: {
    roomId: string
    playerIds: string[]
  }): Promise<ApiResponse<string | null>> => {
    const { $firestore } = useNuxtApp()
    const status: RoomStatus = 'SECOND_HALF_STARTED'
    try {
      await $firestore.collection('rooms').doc(roomId).update({
        status,
        playerIds,
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
   * ルームを作成する
   * @param input
   * @returns
   */
  create: async ({
    input,
  }: {
    input: CreateRoomInput
  }): Promise<ApiResponse<string | null>> => {
    const { $firestore } = useNuxtApp()
    try {
      await $firestore.collection('rooms').doc(input.hostId).set(input)

      return {
        data: input.hostId,
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
   * ルームを削除する
   * @param roomId
   * @returns
   */
  delete: async ({
    roomId,
  }: {
    roomId: string
  }): Promise<ApiResponse<string | null>> => {
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
  resetPlayerIds: async ({
    roomId,
  }: {
    roomId: string
  }): Promise<ApiResponse<string | null>> => {
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
  addPlayerId: async ({
    playerId,
    roomId,
  }: {
    playerId: string
    roomId: string
  }): Promise<ApiResponse<Room['playerIds']>> => {
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
  removeFirstPlayerId: async ({
    roomId,
  }: {
    roomId: string
  }): Promise<ApiResponse<Room['playerIds']>> => {
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
  /**
   * ゲームを終了させる
   * @param roomId
   * @param status
   * @returns
   */
  finishGame: async ({
    roomId,
    status,
  }: {
    roomId: string
    status: RoomStatus
  }): Promise<ApiResponse<string | null>> => {
    const { $firestore } = useNuxtApp()
    // const status: RoomStatus = "FIRST_HALF_FINISHED"
    try {
      await $firestore.collection('rooms').doc(roomId).update({
        status,
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
   * ルームをリセットする
   * @param roomId
   * @returns
   */
  reset: async ({
    roomId,
  }: {
    roomId: string
  }): Promise<ApiResponse<string | null>> => {
    const { $firestore } = useNuxtApp()
    const status: RoomStatus = 'NOT_STARTED'
    try {
      await $firestore.collection('rooms').doc(roomId).update({
        status,
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
