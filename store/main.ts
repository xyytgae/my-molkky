import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'

interface State {
  gameHistoryCreatedAt: Array<any>
  gameHistoryUsers: Array<any>
  userData: Array<any>
}

export const useMainStore = defineStore('main', {
  state: (): State => ({
    gameHistoryCreatedAt: [],
    gameHistoryUsers: [],
    userData: [],
  }),
  getters: {
    getterGameHistoryCreatedAt: (state) => state.gameHistoryCreatedAt,
    getterGameHistoryUsers: (state) => state.gameHistoryUsers,
  },
  actions: {
    getGameHistory({ userId }) {
      useNuxtApp()
        .$firestore.collection('users')
        .doc(userId)
        .collection('games')
        .orderBy('createdAt', 'desc')
        .limit(15)
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            const docData = doc.data()
            const { createdAt } = docData
            this.gameHistoryCreatedAt.push({ createdAt })

            doc.ref
              .collection('game')
              .orderBy('sum', 'desc')
              .get()
              .then((subSnapshot) => {
                subSnapshot.forEach((subDoc) => {
                  const subDocData = subDoc.data()
                  const { firstHalfScore, totalScore, sum, name, id } =
                    subDocData
                  const params = { firstHalfScore, totalScore, sum, name, id }

                  this.userData.push({ ...params })
                })

                this.gameHistoryUsers.push(this.userData)
                this.userData = []
              })
          })
        })
    },
    clearGameHistory() {
      this.gameHistoryCreatedAt = []
      this.gameHistoryUsers = []
      this.userData = []
    },
  },
})
