import { useNuxtApp, useRouter, useState } from '#app'
import {
  onSnapshot,
  Unsubscribe,
  doc,
  serverTimestamp,
  FieldValue,
} from 'firebase/firestore'
import { Room, ApiResponse } from '../types/api'
import { playerRepo } from '~/apis/player'
import { roomConverter } from '~/modules/firestoreDataConverter/models/room'

const createDefaultRoom = (createdAt: FieldValue): Room => ({
  id: '',
  hostId: '',
  name: '',
  createdAt,
  delete: false,
  playerIds: [],
  status: 'NOT_STARTED',
})

export const useRoom = () => {
  const { $firestore } = useNuxtApp()
  const router = useRouter()
  const room = useState<Room>('room', () =>
    createDefaultRoom(serverTimestamp())
  )

  const subscribeRoomDeletion = async (
    userId: string,
    roomId: string
  ): Promise<ApiResponse<Unsubscribe | null>> => {
    try {
      const unsubscribe = await onSnapshot(
        doc($firestore, 'rooms', roomId).withConverter(roomConverter),
        {
          includeMetadataChanges: true,
        },
        (doc) => {
          const docData = doc.data()
          if (!doc.exists() || docData === undefined) {
            router.push('/mode')
            return
          }
          if (docData.delete) {
            playerRepo.delete({
              roomId,
              playerId: userId,
            })
            router.push('/mode')
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
      const unsubscribe = await onSnapshot(
        doc($firestore, 'rooms', roomId).withConverter(roomConverter),
        {
          includeMetadataChanges: true,
        },
        (doc) => {
          const docData = doc.data()
          if (!doc.exists() || docData === undefined) {
            return {
              data: null,
              success: false,
              error: 'エラーが発生しました',
            }
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

  return {
    room,
    subscribeRoomDeletion,
    subscribeRoomStatusAndPlayerIds,
  }
}
