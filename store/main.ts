import { defineStore } from 'pinia'
import { useNuxtApp, useRouter } from '#app'

interface State {
  login_user: any | null
  registered_user: any | null
  gameHistoryCreatedAt: Array<any>
  gameHistoryUsers: Array<any>
  userData: Array<any>
}

export const useMainStore = defineStore('main', {
  state: (): State => ({
    login_user: null,
    registered_user: null,
    gameHistoryCreatedAt: [],
    gameHistoryUsers: [],
    userData: [],
  }),
  getters: {
    getterLogin_user: (state) => state.login_user,
    getterRegistered_user: (state) => state.registered_user,
    getterGameHistoryCreatedAt: (state) => state.gameHistoryCreatedAt,
    getterGameHistoryUsers: (state) => state.gameHistoryUsers,
  },
  actions: {
    async guestLogin({ email, password }) {
      await useNuxtApp()
        .$fireAuth.signInWithEmailAndPassword(email, password)
        .then(() => {
          // this.$router.push('/')
          useRouter().push('/')
          // this.$router.push('/')
        })
    },
    login() {
      const google_auth_provider =
        new useNuxtApp().$fireAuth.GoogleAuthProvider()
      useNuxtApp().$fireAuth.signInWithRedirect(google_auth_provider)
    },
    logout() {
      useNuxtApp().$fireAuth.signOut()
    },
    setLoginUser({ uid, displayName, email }) {
      this.login_user = { uid, displayName, email }
    },
    deleteLoginUser() {
      this.login_user = null
    },
    getRegisteredUser({ uid }) {
      useNuxtApp()
        .$firestore.collection('users')
        .doc(uid)
        .get()
        .then((doc) => {
          const docData = doc.data()
          const { name, iconImageUrl, stars } = docData
          this.registered_user = { name, iconImageUrl, stars }
        })
    },

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
