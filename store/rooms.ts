import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'

export const useRoomsStore = defineStore('rooms', {
  state: () => ({
    rooms: [],
  }),
  getters: {
    getterRooms: (state) => state.rooms,
  },
  actions: {
    subscribe() {
      return useNuxtApp()
        .$firestore.collection('rooms')
        .orderBy('createdAt', 'desc')
        .onSnapshot((roomsSnapShot) => {
          roomsSnapShot.docChanges().forEach((snapshot) => {
            const room = {
              id: snapshot.doc.id,
              ...snapshot.doc.data(),
            }

            switch (snapshot.type) {
              case 'added':
                this.add({ room })
                break

              case 'modified':
                this.update({ room })
                break

              case 'removed':
                this.remove({ room })
                break
            }
          })
        })
    },

    add({ room }) {
      const isNotAdded = !this.rooms.find((r) => r.id === room.id)

      if (isNotAdded) {
        this.rooms.push(room)
      }
    },
    update({ room }) {
      this.rooms = this.rooms.map((r) => {
        if (r.id === room.id) {
          r = room
        }
        return r
      })
    },

    remove({ room }) {
      this.rooms = this.rooms.filter((r) => r.id !== room.id)
    },
    clear() {
      this.rooms = []
    },
  },
})
