export const state = () => ({
  room: [],
  userOrder: 0,
})

export const getters = {
  room: state => state.room,
  userOrder: state => state.userOrder,
}

export const mutations = {
  add(state, { room }) {
    const isNotAdded = !state.room.find(r => r.id === room.id)

    if (isNotAdded) {
      state.room.push(room)
    }
  },

  update(state, { room }) {
    state.room = state.room.map(r => {
      if (r.id === room.id) {
        r = room
      }
      return r
    })
  },

  remove(state, { room }) {
    state.room = state.room.filter(r => r.id !== room.id)
  },

  setUser(state, { room }) {
    if (room) {
      state.room.push(room)
    }
  },

  clear(state) {
    state.room = []
  },

  getUser(state, { user }) {
    state.room.push({ ...user })
  },

  getUserOrder(state, { userOrder }) {
    state.userOrder = userOrder
  },
}

export const actions = {
  setUser({ commit }, { user, roomId }) {
    const room = {
      totalScore: 0,
      score: [],
      order: 0,
      stars: user.stars,
      id: user.uid,
      name: user.name,
      iconImageUrl: user.iconImageUrl,
      createdAt: this.$firebase.firestore.FieldValue.serverTimestamp(),
    }

    this.$firestore
      .collection('rooms')
      .doc(roomId)
      .collection('room')
      .doc(user.uid)
      .set(room)

    commit('add', { room })
  },
  // setScore({}, { userId, roomId }) {
  //   this.$firestore
  //     .collection('rooms')
  //     .doc(roomId)
  //     .collection('room')
  //     .doc(userId)
  //     .update({
  //       score: [],
  //       totalScore: 0,
  //     })
  // },
  getUser({ commit }, { roomId }) {
    this.$firestore
      .collection('rooms')
      .doc(roomId)
      .collection('room')
      .orderBy('order')
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          const data = doc.data()
          const user = {
            ...data,
          }
          commit('getUser', { user })
        })
      })
  },
  subscribe({ commit }, { roomId }) {
    return this.$firestore
      .collection('rooms')
      .doc(roomId)
      .collection('room')
      .orderBy('order', 'asc')
      .onSnapshot(roomSnapshot => {
        roomSnapshot.docChanges().forEach(snapshot => {
          const docData = snapshot.doc.data()
          const room = {
            id: snapshot.doc.id,
            ...docData,
          }

          switch (snapshot.type) {
            case 'added':
              commit('add', { room })
              break

            case 'modified':
              commit('update', { room })
              break

            case 'removed':
              commit('remove', { room })
              break
          }
        })
      })
  },

  start({ redirect }, { roomId }) {
    return this.$firestore
      .collection('rooms')
      .doc(roomId)
      .onSnapshot(
        {
          includeMetadataChanges: true,
        },
        doc => {
          const docData = doc.data()
          if (docData.gameStart) {
            // redirect('/game')
            this.$router.push(`/game/${roomId}`)
          } else {
            this.$router.push(`/room/${roomId}`)
          }
        },
      )
  },
  finish({}, { roomId }) {
    this.$firestore
      .collection('rooms')
      .doc(roomId)
      .update({
        gameStart: false,
      })
  },
  clear({ commit }) {
    // clear({ commit }, { userId, roomId }) {
    // this.$firestore
    //   .collection('rooms')
    //   .doc(roomId)
    //   .collection('room')
    //   .doc(userId)
    //   .delete()
    commit('clear')
  },

  decideOrder({ commit }, { order, roomId }) {
    order.forEach(o => {
      const number = order.findIndex(item => item === o)

      if (number !== -1) {
        this.$firestore
          .collection('rooms')
          .doc(roomId)
          .collection('room')
          .doc(o)
          .update({
            order: number,
          })
      }
    })
  },

  startGame({ commit }, { roomId }) {
    this.$firestore
      .collection('rooms')
      .doc(roomId)
      .update({
        gameStart: true,
      })
  },

  // スコアを記録
  inputScore({}, { totalScore, score, userId, roomId }) {
    this.$firestore
      .collection('rooms')
      .doc(roomId)
      .collection('room')
      .doc(userId)
      .update({
        score,
        totalScore,
      })
  },

  // 現在、誰の順番かを取得
  getUserOrder({ commit }, { roomId }) {
    this.$firestore
      .collection('rooms')
      .doc(roomId)
      .onSnapshot(
        {
          includeMetadataChanges: true,
        },
        doc => {
          const docData = doc.data()
          const userOrder = docData.userOrder
          commit('getUserOrder', { userOrder })
        },
      )
  },

  // 順番を切り替える
  changeUserOrder({}, { roomId, order }) {
    this.$firestore
      .collection('rooms')
      .doc(roomId)
      .update({
        userOrder: order,
      })
  },
}
