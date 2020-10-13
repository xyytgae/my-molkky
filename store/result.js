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
  getWinner({ commit }, { roomId }) {
    this.$firestore
      .collection('rooms')
      .doc(roomId)
      .collection('room')
      .orderBy('totalScore', 'desc')
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
  // getFiftyScorer({ dispatch, commit }, { roomId }) {
  //   this.$firestore
  //     .collection('rooms')
  //     .doc(roomId)
  //     .collection('room')
  //     .where('totalScore', '==', 50)
  //     .get()
  //     .then(snapshot => {
  //       if (snapshot.size !== 1) {
  //         dispatch('getEliminationFalse', { roomId })
  //         return
  //       }
  //       snapshot.forEach(doc => {
  //         const docData = doc.data()
  //         const winner = {
  //           ...docData,
  //         }
  //         commit('getWinner', { winner })
  //       })
  //     })
  // },

  // getEliminationFalse({ commit }, { roomId }) {
  //   this.$firestore
  //     .collection('rooms')
  //     .doc(roomId)
  //     .collection('room')
  //     .where('elimination', '==', false)
  //     .get()
  //     .then(snapshot => {
  //       snapshot.forEach(doc => {
  //         const docData = doc.data()
  //         const winner = {
  //           ...docData,
  //         }
  //         commit('getWinner', { winner })
  //       })
  //     })
  // },

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

  clearFirestore({}, { userId, roomId }) {
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
