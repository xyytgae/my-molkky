export const state = () => ({
  login_user: null,
  registered_user: null,
})

export const getters = {
  login_user: state => state.login_user,
  registered_user: state => state.registered_user,
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
}

export const actions = {
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
        // if (doc.exists) {
        // }
      })
  },
}
