import { defineStore } from 'pinia'
import { useNuxtApp, useRouter } from '#app'

export const useRoomStore = defineStore('room', {
  state: () => ({
    room: [],
  }),
  getters: {
    getterRoom: (state) => state.room,
  },
  actions: {
    decideOrder({ users, roomId }) {
      users.forEach((u, index) => {
        useNuxtApp()
          .$firestore.collection('rooms')
          .doc(roomId)
          .collection('room')
          .doc(u)
          .update({
            order: index,
          })
          .then(() => {
            useNuxtApp().$firestore.collection('rooms').doc(roomId).update({
              users,
            })
          })
      })
    },

    startGame({ roomId }) {
      useNuxtApp().$firestore.collection('rooms').doc(roomId).update({
        // gameStart: true,
        startFirstHalf: true,
      })
    },
    setUser({ user, roomId }) {
      const room = {
        score: [],
        firstHalfScore: 0,
        totalScore: 0,
        elimination: false,
        order: 0,
        stars: user.stars,
        id: user.uid,
        name: user.name,
        iconImageUrl: user.iconImageUrl,
        createdAt:
          useNuxtApp().$firebase.firestore.FieldValue.serverTimestamp(),
      }

      useNuxtApp()
        .$firestore.collection('rooms')
        .doc(roomId)
        .collection('room')
        .doc(user.uid)
        .set(room)

      this.add({ room })
    },

    // ルームに入室しているユーザーをリアルタイムで監視する
    subscribe({ roomId }) {
      return useNuxtApp()
        .$firestore.collection('rooms')
        .doc(roomId)
        .collection('room')
        .orderBy('order', 'asc')
        .onSnapshot((roomSnapshot) => {
          roomSnapshot.docChanges().forEach((snapshot) => {
            const docData = snapshot.doc.data()
            const room = {
              id: snapshot.doc.id,
              ...docData,
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

    start({ userId, roomId }) {
      const router = useRouter()
      return useNuxtApp()
        .$firestore.collection('rooms')
        .doc(roomId)
        .onSnapshot(
          {
            includeMetadataChanges: true,
          },
          (doc) => {
            const docData = doc.data()
            if (docData.delete) {
              this.exitRoom({ userId, roomId })
              router.push('/')
            }
            if (docData.startFirstHalf) {
              router.push(`/game/${roomId}`)
            }
          },
        )
    },
    clear() {
      this.room = []
    },
    exitRoom({ userId, roomId }) {
      useNuxtApp()
        .$firestore.collection('rooms')
        .doc(roomId)
        .collection('room')
        .doc(userId)
        .delete()
    },
    deleteRoom({}, { roomId }) {
      const db = useNuxtApp().$firestore.collection('rooms').doc(roomId)

      db.update({
        delete: true,
      }).then(() => {
        db.delete()
      })
    },

    add({ room }) {
      const isNotAdded = !this.room.find((r) => r.id === room.id)
      if (isNotAdded) {
        this.room.push(room)
      }
    },

    update({ room }) {
      this.room = this.room.map((r) => {
        if (r.id === room.id) {
          r = room
        }
        return r
      })
    },
    remove({ room }) {
      this.room = this.room.filter((r) => r.id !== room.id)
    },
  },
})
