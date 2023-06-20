import { useState, useNuxtApp } from '#app'
import { Player, ApiResponse } from '../types/api'
import { Unsubscribe } from 'firebase'

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
      const unsubscribe = await $firestore
        .collection('rooms')
        .doc(roomId)
        .collection('players')
        .orderBy('order', 'asc')
        .onSnapshot((usersSnapShot) => {
          usersSnapShot.docChanges().forEach((snapshot) => {
            const user: Player = {
              id: snapshot.doc.id,
              ...(snapshot.doc.data() as Omit<Player, 'id'>),
            }

            switch (snapshot.type) {
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
        })

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
