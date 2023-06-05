import { useNuxtApp, useRouter, useState } from '#app'
import { Room, ApiResponse } from '../types/api'
import { Unsubscribe, firestore } from 'firebase'
import { waitingUsersRepo } from '~/apis/waitingUser'

const createDefaultRoom = (createdAt: firestore.FieldValue): Room => ({
  id: '',
  hostId: '',
  name: '',
  password: '',
  topImageUrl: '',
  createdAt,
  delete: false,
  playerIds: [],
  status: 'NOT_STARTED',
})

export const useWaitingRoom = () => {
  const { $firestore, $firebase } = useNuxtApp()
  const router = useRouter()
  const room = useState<Room>('room', () =>
    createDefaultRoom($firebase.firestore.FieldValue.serverTimestamp())
  )

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
            if (docData.status !== 'NOT_STARTED') {
              router.push(`/game/${roomId}`)
            }
            room.value = docData
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

  const subscribeRoomStatusAndPlayerIds = async (
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
            room.value = docData
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
    room,
    subscribeRoomDeletion,
    subscribeRoomStatusAndPlayerIds,
  }
}
