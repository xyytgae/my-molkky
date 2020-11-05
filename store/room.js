export const state = () => ({
  room: [],
})

export const getters = {
  room: state => state.room,
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
  clear(state) {
    state.room = []
  },
}

export const actions = {
  decideOrder({}, { users, roomId }) {
    users.forEach((u, index) => {
      this.$firestore
        .collection('rooms')
        .doc(roomId)
        .collection('room')
        .doc(u)
        .update({
          order: index,
        })
        .then(() => {
          this.$firestore
            .collection('rooms')
            .doc(roomId)
            .update({
              users,
            })
        })
    })
  },

  startGame({}, { roomId }) {
    this.$firestore
      .collection('rooms')
      .doc(roomId)
      .update({
        // gameStart: true,
        startFirstHalf: true,
      })
  },
  setUser({ commit }, { user, roomId }) {
    const room = {
      score: [],
      firstHalfScore: 0,
      totalScore: 0,
      elimination: false,
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

  // ルームに入室しているユーザーをリアルタイムで監視する
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

  start({ dispatch }, { userId, roomId }) {
    return this.$firestore
      .collection('rooms')
      .doc(roomId)
      .onSnapshot(
        {
          includeMetadataChanges: true,
        },
        doc => {
          const docData = doc.data()
          if (docData.delete) {
            dispatch('exitRoom', { userId, roomId })
            this.$router.push('/')
          }
          if (docData.startFirstHalf) {
            this.$router.push(`/game/${roomId}`)
          }
        },
      )
  },
  clear({ commit }) {
    commit('clear')
  },
  exitRoom({}, { userId, roomId }) {
    this.$firestore
      .collection('rooms')
      .doc(roomId)
      .collection('room')
      .doc(userId)
      .delete()
  },
  deleteRoom({}, { roomId }) {
    const db = this.$firestore.collection('rooms').doc(roomId)

    db.update({
      delete: true,
    }).then(() => {
      db.delete()
    })
  },
}
