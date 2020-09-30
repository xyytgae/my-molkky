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

  setUser(state, { room }) {
    if (room) {
      state.room.push(room)
    }
  },

  clear(state) {
    state.room = []
  },
}

export const actions = {
  setUser({ commit }, { user, roomId }) {
    const room = {
      // color: 'red',
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
  subscribe({ commit }, { roomId }) {
    return this.$firestore
      .collection('rooms')
      .doc(roomId)
      .collection('room')
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
  clear({ commit }, { userId, roomId }) {
    this.$firestore
      .collection('rooms')
      .doc(roomId)
      .collection('room')
      .doc(userId)
      .delete()
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
}
