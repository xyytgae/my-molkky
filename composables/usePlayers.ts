import { useState, useNuxtApp } from '#app'
import {
  onSnapshot,
  Unsubscribe,
  query,
  collection,
  orderBy,
} from 'firebase/firestore'
import { Player, ApiResponse } from '../types/api'
import { playerConverter } from '~/modules/firestoreDataConverter/models/player'

const add = (users: Player[], addedUser: Player): Player[] => {
  const isNotAdded = !users.find((user) => user.id === addedUser.id)
  if (isNotAdded) {
    users.push(addedUser)
  }
  return users
}

const update = (users: Player[], updatedRoom: Player): Player[] => {
  return users.map((user) => (user.id === updatedRoom.id ? updatedRoom : user))
}

const remove = (users: Player[], updatedRoom: Player): Player[] => {
  return users.filter((user) => user.id !== updatedRoom.id)
}

export const usePlayers = () => {
  const { $firestore } = useNuxtApp()
  const users = useState<Player[]>('users', () => [])

  const subscribePlayers = async (
    roomId: string
  ): Promise<ApiResponse<Unsubscribe | null>> => {
    try {
      users.value = []
      const unsubscribe = await onSnapshot(
        query(
          collection($firestore, 'rooms', roomId, 'players').withConverter(
            playerConverter
          ),
          orderBy('order', 'asc')
        ),
        (usersSnapShot) => {
          usersSnapShot.docChanges().forEach((change) => {
            const user = change.doc.data()

            switch (change.type) {
              case 'added':
                users.value = add(users.value, user)
                break

              case 'modified':
                users.value = update(users.value, user)
                break

              case 'removed':
                users.value = remove(users.value, user)
                break
            }
          })
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
    // NOTE: 型の都合でreadonlyをつけていない
    users,
    subscribePlayers,
  }
}
