import { useNuxtApp } from '#app'
import { setDoc, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore'
import { ApiResponse, Room, RoomStatus, CreateRoomInput } from '../types/api'

export const roomRepo = {
  /**
   * ルームを取得する
   * @param roomId
   * @returns
   */
  get: async ({
    roomId,
  }: {
    roomId: string
  }): Promise<ApiResponse<Room | null>> => {
    const { $firestore } = useNuxtApp()
    try {
      const roomDoc = await getDoc(doc($firestore, 'rooms', roomId))
      const room = roomDoc.data() as Room

      return {
        data: room,
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
      await updateDoc(doc($firestore, 'rooms', roomId), {
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
      await updateDoc(doc($firestore, 'rooms', roomId), {
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
      await setDoc(doc($firestore, 'rooms', input.hostId), input)

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
      await updateDoc(doc($firestore, 'rooms', roomId), {
        delete: true,
      })
      await deleteDoc(doc($firestore, 'rooms', roomId))

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
      await updateDoc(doc($firestore, 'rooms', roomId), {
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
      const roomDoc = await getDoc(doc($firestore, 'rooms', roomId))
      const { playerIds } = roomDoc.data() as Room
      const newPlayerIds = [...playerIds, playerId]

      await updateDoc(doc($firestore, 'rooms', roomId), {
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
   * プレイヤーの順序を更新する
   * @param playerIds
   * @param roomId
   * @returns
   */
  updatePlayerIds: async ({
    playerIds,
    roomId,
  }: {
    playerIds: string[]
    roomId: string
  }): Promise<ApiResponse<Room['playerIds']>> => {
    const { $firestore } = useNuxtApp()
    try {
      await updateDoc(doc($firestore, 'rooms', roomId), {
        playerIds,
      })

      return {
        data: playerIds,
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
      const roomDoc = await getDoc(doc($firestore, 'rooms', roomId))
      const { playerIds } = roomDoc.data() as Room
      const newPlayerIds = [...playerIds]
      newPlayerIds.shift()
      await updateDoc(doc($firestore, 'rooms', roomId), {
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
      await updateDoc(doc($firestore, 'rooms', roomId), {
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
      await updateDoc(doc($firestore, 'rooms', roomId), {
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
