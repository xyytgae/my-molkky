import { useState, useNuxtApp } from '#app'
import { PlayingUser, ApiResponse } from '../types/api'
import { readonly } from '#imports'
import { Unsubscribe } from 'firebase'

const add = (users: PlayingUser[], addedUser: PlayingUser): PlayingUser[] => {
  const isNotAdded = !users.find((user) => user.id === addedUser.id)
  if (isNotAdded) {
    users.push(addedUser)
  }
  return users
}

const update = (
  users: PlayingUser[],
  updatedRoom: PlayingUser
): PlayingUser[] => {
  return users.map((user) => (user.id === updatedRoom.id ? updatedRoom : user))
}

const remove = (
  users: PlayingUser[],
  updatedRoom: PlayingUser
): PlayingUser[] => {
  return users.filter((user) => user.id !== updatedRoom.id)
}

export const useWaitingUsers = () => {
  const { $firestore } = useNuxtApp()
  const users = useState<PlayingUser[]>('users', () => [])

  const subscribeUsers = async (
    roomId: string
  ): Promise<ApiResponse<Unsubscribe | null>> => {
    try {
      users.value = []
      const unsubscribe = await $firestore
        .collection('rooms')
        .doc(roomId)
        .collection('room')
        .orderBy('order', 'asc')
        .onSnapshot((usersSnapShot) => {
          usersSnapShot.docChanges().forEach((snapshot) => {
            const user: PlayingUser = {
              id: snapshot.doc.id,
              ...(snapshot.doc.data() as Omit<PlayingUser, 'id'>),
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
    users: readonly(users),
    subscribeUsers,
  }
}
