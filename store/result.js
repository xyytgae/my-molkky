export const state = () => ({
  result: [],
  winner: [],
  startSecondHalf: false,
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

  getStartSecondHalf(state, { startSecondHalf }) {
    state.startSecondHalf = startSecondHalf
  },

  clear(state) {
    state.result = []
    state.winner = []
  },
}

export const actions = {
  getWinner({ dispatch, commit }, { roomId, userId }) {
    const db = this.$firestore
      .collection('rooms')
      .doc(roomId)
      .collection('room')

    db.orderBy('sum', 'desc')
      .limit(1)
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          const docData = doc.data()

          db.where('sum', '==', docData.sum)
            .get()
            .then(snapshot => {
              snapshot.forEach(doc => {
                const docData = doc.data()
                const winner = {
                  ...docData,
                }

                commit('getWinner', { winner })

                // 勝者のstarを1増やす
                if (userId === winner.id) {
                  dispatch('incrementStars', { winner })
                }
              })
            })
        })
      })
      .then(() => {
        dispatch('recordData', { roomId, userId })
      })
  },

  incrementStars({}, { winner }) {
    this.$firestore
      .collection('users')
      .doc(winner.id)
      .update({
        stars: this.$firebase.firestore.FieldValue.increment(1),
        stones: this.$firebase.firestore.FieldValue.increment(1),
      })
  },

  getResult({ dispatch, commit, state }, { roomId, userId }) {
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
    // .then(() => {
    //   dispatch('getStartSecondHalf', { roomId })
    // })

    // .then(() => {
    //   if (state.winner.length > 0) {
    //     dispatch('recordData', { userId })
    //   }
    // })
  },

  recordData({ state }, { roomId, userId }) {
    const newRef = this.$firestore
      .collection('users')
      .doc(userId)
      .collection('games')
      .doc()

    newRef.set({
      createdAt: this.$firebase.firestore.FieldValue.serverTimestamp(),
    })

    this.$firestore
      .collection('rooms')
      .doc(roomId)
      .collection('room')
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          const docData = doc.data()
          const params = {
            ...docData,
          }

          newRef
            .collection('game')
            .doc(params.id)
            .set(params)
        })
      })

    // state.result.forEach(r => {
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
    this.$firestore
      .collection('rooms')
      .doc(roomId)
      .update({
        startFirstHalf: false,
        startSecondHalf: false,
        finishFirstHalf: false,
        finishSecondHalf: false,
        users: [],
      })
  },

  getStartSecondHalf({ commit }, { roomId }) {
    this.$firestore
      .collection('rooms')
      .doc(roomId)
      .get()
      .then(doc => {
        const docData = doc.data()
        const startSecondHalf = docData.startSecondHalf
        commit('getStartSecondHalf', { startSecondHalf })
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
