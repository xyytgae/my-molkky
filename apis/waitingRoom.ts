import { useNuxtApp } from '#app'
import { ApiResponse } from '../types/api'

export const waitingRoomRepo = {
  updateToStart: async (
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
}
