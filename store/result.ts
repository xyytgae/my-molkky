import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'

export const useResultStore = defineStore('result', {
  state: () => ({
    result: [],
    winner: [],
    startSecondHalf: false,
  }),
  getters: {
    getterResult: (state) => state.result,
    getterWinner: (state) => state.winner,
  },

  actions: {
    getWinner({ roomId, userId }) {
      const db = useNuxtApp()
        .$firestore.collection('rooms')
        .doc(roomId)
        .collection('room')

      db.orderBy('sum', 'desc')
        .limit(1)
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            const docData = doc.data()

            db.where('sum', '==', docData.sum)
              .get()
              .then((snapshot) => {
                snapshot.forEach((doc) => {
                  const docData = doc.data()
                  const winner = {
                    ...docData,
                  }

                  this.winner.push(winner)

                  // 勝者のstarを1増やす
                  if (userId === winner.id) {
                    this.incrementStars({ winner })
                  }
                })
              })
          })
        })
        .then(() => {
          this.recordData({ roomId, userId })
        })
    },

    incrementStars({ winner }) {
      useNuxtApp()
        .$firestore.collection('users')
        .doc(winner.id)
        .update({
          stars: useNuxtApp().$firestore.FieldValue.increment(1),
          stones: useNuxtApp().$firestore.FieldValue.increment(1),
        })
    },

    getResult({ roomId, userId }) {
      useNuxtApp()
        .$firestore.collection('rooms')
        .doc(roomId)
        .collection('room')
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            const docData = doc.data()
            const result = {
              ...docData,
            }
            this.result.push(result)
          })
        })
      // .then(() => {
      //   dispatch('getStartSecondHalf', { roomId })
      // })

      // .then(() => {
      //   if (this.winner.length > 0) {
      //     dispatch('recordData', { userId })
      //   }
      // })
    },

    recordData({ roomId, userId }) {
      const newRef = useNuxtApp()
        .$firestore.collection('users')
        .doc(userId)
        .collection('games')
        .doc()

      newRef.set({
        createdAt: useNuxtApp().$firestore.FieldValue.serverTimestamp(),
      })

      useNuxtApp()
        .$firestore.collection('rooms')
        .doc(roomId)
        .collection('room')
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            const docData = doc.data()
            const params = {
              ...docData,
            }

            newRef.collection('game').doc(params.id).set(params)
          })
        })

      // this.result.forEach(r => {
      //   const params = {
      //     ...r,
      //   }
      //   newRef
      //     .collection('game')
      //     .doc(r.id)
      //     .set(params)
      // })
    },

    resetRoom({}, { roomId }) {
      useNuxtApp().$firestore.collection('rooms').doc(roomId).update({
        startFirstHalf: false,
        startSecondHalf: false,
        finishFirstHalf: false,
        finishSecondHalf: false,
        users: [],
      })
    },

    getStartSecondHalf({ roomId }) {
      useNuxtApp()
        .$firestore.collection('rooms')
        .doc(roomId)
        .get()
        .then((doc) => {
          const docData = doc.data()
          const startSecondHalf = docData.startSecondHalf
          this.startSecondHalf = startSecondHalf
        })
    },

    clearFirestore({ userId, roomId }) {
      useNuxtApp()
        .$firestore.collection('rooms')
        .doc(roomId)
        .collection('room')
        .doc(userId)
        .delete()
    },

    clear() {
      this.result = []
      this.winner = []
    },
  },
})
