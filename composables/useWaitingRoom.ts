import { useNuxtApp, useRouter } from '#app'
import { Room, ApiResponse } from '../types/api'
import { Unsubscribe } from 'firebase'
import { waitingUsersRepo } from '~/apis/waitingUser'

export const useWaitingRoom = () => {
  const { $firestore } = useNuxtApp()
  const router = useRouter()

  const subscribeRoomDeletion = async (
    userId: string,
    roomId: string
  ): Promise<ApiResponse<Unsubscribe | null>> => {
    try {
      const unsubscribe = await $firestore
        .collection('rooms')
        .doc(roomId)
        .onSnapshot(
          {
            includeMetadataChanges: true,
          },
          (doc) => {
            const docData = doc.data() as Room
            if (docData.delete) {
              waitingUsersRepo.deleteUser(userId, roomId)
              router.push('/rooms')
            }
            if (docData.startFirstHalf) {
              router.push(`/game/${roomId}`)
            }
          }
        )

      return {
        data: unsubscribe,
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
  }

  return {
    subscribeRoomDeletion,
  }
}
