import { useState, useNuxtApp } from '#app'
import { Room, ApiResponse } from '../types/api'
import { readonly } from '#imports'
import { Unsubscribe } from 'firebase'

const add = (rooms: Room[], addedRoom: Room): Room[] => {
  const isNotAdded = !rooms.find((room) => room.id === addedRoom.id)
  if (isNotAdded) {
    rooms.push(addedRoom)
  }
  return rooms
}

const update = (rooms: Room[], updatedRoom: Room): Room[] => {
  return rooms.map((room) => {
    if (room.id === updatedRoom.id) {
      room = updatedRoom
    }
    return room
  })
}

const remove = (rooms: Room[], removedRoom: Room): Room[] => {
  return rooms.filter((room) => room.id !== removedRoom.id)
}

export const useRooms = () => {
  const { $firestore } = useNuxtApp()
  const rooms = useState<Room[]>('rooms', () => [])

  const subscribe = async (): Promise<ApiResponse<Unsubscribe | null>> => {
    try {
      rooms.value = []
      const unsubscribe = await $firestore
        .collection('rooms')
        .orderBy('createdAt', 'desc')
        .onSnapshot((roomsSnapShot) => {
          roomsSnapShot.docChanges().forEach((snapshot) => {
            const room: Room = {
              id: snapshot.doc.id,
              ...(snapshot.doc.data() as Omit<Room, 'id'>),
            }

            switch (snapshot.type) {
              case 'added':
                rooms.value = add(rooms.value, room)
                break

              case 'modified':
                rooms.value = update(rooms.value, room)
                break

              case 'removed':
                rooms.value = remove(rooms.value, room)
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
    rooms,
    subscribe,
  }
}
