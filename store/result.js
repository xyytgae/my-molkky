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

  clear(state) {
    state.result = []
    state.winner = []
  },
}

export const actions = {
  getWinner({ dispatch, commit }, { roomId, userId }) {
    this.$firestore
      .collection('rooms')
      .doc(roomId)
      .collection('room')
      .orderBy('totalScore', 'desc')
      .limit(1)
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          const docData = doc.data()
          const winner = {
            ...docData,
          }
          commit('getWinner', { winner })

          // 勝者のstarを1増やす
          if(userId === winner.id) {
            dispatch('incrementStars', { winner })
          }
        })
      })
  },

  incrementStars({}, { winner }) {
    this.$firestore
      .collection('users')
      .doc(winner.id)
      .update({
        stars: this.$firebase.firestore.FieldValue.increment(1)
      })
  },

  getResult({ dispatch, commit }, { roomId, userId }) {
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
      .then(() => {
        dispatch('recordData', { userId })
      })
  }, 

  recordData({ state }, { userId }) {
    const newRef = this.$firestore
      .collection('users')
      .doc(userId)
      .collection('games')
      .doc()
      .collection('game')

    state.result.forEach(r => {
      const params = {
        finishedAt: this.$firebase.firestore.FieldValue.serverTimestamp(),
        ...r,
      }
      newRef.doc(r.id).set(params)
    })
  },

  resetRoom({ }, { roomId }) {
    this.$firestore
      .collection('rooms')
      .doc(roomId)
      .update({
        startFirstHalf: false,
        startSecondHalf: false,
        finishFirstHalf: false,
        finishSecondHalf: false,
        users: []
      })
  },

  clearFirestore({ }, { userId, roomId }) {
    this.$firestore
      .collection('rooms')
      .doc(roomId)
      .collection('room')
      .doc(userId)
      .delete()
  },

  clear({ commit }) {
    commit('clear')
  },
}
