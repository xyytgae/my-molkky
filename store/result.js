export const state = () => ({
  result: [],
  winner: [],
})

export const getters = {
  result: state => state.result,
  winner: state => state.winner,
}

export const mutations = {
  getResult(state, { result }) {
    state.result.push(result)
  },
  getWinner(state, { winner }) {
    state.winner.push(winner)
  },
}

export const actions = {
  getResult({ commit }, { roomId }) {
    this.$firestore
      .collection('rooms')
      .doc(roomId)
      .collection('room')
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          const docData = doc.data()
          const result = {
            ...docData,
          }
          commit('getResult', { result })
        })
      })
  },
  getWinner({ commit }, { roomId }) {
    this.$firestore
      .collection('rooms')
      .doc(roomId)
      .collection('room')
      .where('totalScore', '==', 50)
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          const docData = doc.data()
          const winner = {
            ...docData,
          }
          commit('getWinner', { winner })
        })
      })
  },
}
