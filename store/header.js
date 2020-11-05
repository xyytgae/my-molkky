export const state = () => ({
  roomData: null,
})

export const getters = {
  roomData: state => state.roomData,
}

export const mutations = {
  getRoom(state, { docData }) {
    state.roomData = docData
  },
}

export const actions = {
  getRoom({ commit }, { roomId }) {
    this.$firestore
      .collection('rooms')
      .doc(roomId)
      .get()
      .then(doc => {
        const docData = doc.data()
        commit('getRoom', { docData })
      })
  },
}
