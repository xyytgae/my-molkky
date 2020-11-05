export const state = () => ({
  login_user: null,
  registered_user: null,
  gameHistoryCreatedAt: [],
  gameHistoryUsers: [],
  userData: [],
})

export const getters = {
  login_user: state => state.login_user,
  registered_user: state => state.registered_user,
  gameHistoryCreatedAt: state => state.gameHistoryCreatedAt,
  gameHistoryUsers: state => state.gameHistoryUsers,
}

export const mutations = {
  setLoginUser(state, { uid, displayName, email }) {
    state.login_user = { uid, displayName, email }
  },
  deleteLoginUser(state) {
    state.login_user = null
  },
  getRegisteredUser(state, { name, iconImageUrl, stars }) {
    state.registered_user = { name, iconImageUrl, stars }
  },

  getGameCreatedAt(state, { createdAt }) {
    state.gameHistoryCreatedAt.push({ createdAt })
  },
  getGameUsers(state) {
    state.gameHistoryUsers.push(state.userData)
  },

  addUserData(state, { ...params }) {
    state.userData.push({ ...params })
  },

  clearGameHistory(state) {
    state.gameHistoryCreatedAt = []
    state.gameHistoryUsers = []
    state.userData = []
  },

  clearUserData(state) {
    state.userData = []
  },
}

export const actions = {
  async guestLogin({}, { email, password }) {
    await this.$fireAuth
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        this.$router.push('/')
      })
  },
  login() {
    const google_auth_provider = new this.$firebase.auth.GoogleAuthProvider()
    this.$fireAuth.signInWithRedirect(google_auth_provider)
  },
  logout() {
    this.$firebase.auth().signOut()
  },
  setLoginUser({ commit }, { uid, displayName, email }) {
    commit('setLoginUser', { uid, displayName, email })
  },
  deleteLoginUser({ commit }) {
    commit('deleteLoginUser')
  },
  getRegisteredUser({ commit }, { uid }) {
    this.$firestore
      .collection('users')
      .doc(uid)
      .get()
      .then(doc => {
        const docData = doc.data()
        const { name, iconImageUrl, stars } = docData
        commit('getRegisteredUser', { name, iconImageUrl, stars })
      })
  },

  getGameHistory({ commit }, { userId }) {
    this.$firestore
      .collection('users')
      .doc(userId)
      .collection('games')
      .orderBy('createdAt', 'desc')
      .limit(15)
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          const docData = doc.data()
          const { createdAt } = docData
          commit('getGameCreatedAt', { createdAt })

          doc.ref
            .collection('game')
            .orderBy('sum', 'desc')
            .get()
            .then(subSnapshot => {
              subSnapshot.forEach(subDoc => {
                const subDocData = subDoc.data()
                const { firstHalfScore, totalScore, sum, name, id } = subDocData
                const params = { firstHalfScore, totalScore, sum, name, id }

                commit('addUserData', {
                  ...params,
                })
              })

              commit('getGameUsers')
              commit('clearUserData')
            })
        })
      })
  },
}
