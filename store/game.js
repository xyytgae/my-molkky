export const state = () => ({
  room: [],
  users: [],
  totalScore: 0,
  showWLDialog: false,
  startSecondHalf: false,
})

export const getters = {
  room: state => state.room,
  users: state => state.users,
  showWLDialog: state => state.showWLDialog,
  startSecondHalf: state => state.startSecondHalf,
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

  addUser(state, { users }) {
    state.users = users
  },

  pushUser(state, { users }) {
    state.users.push(users)
  },

  getUser(state, { user }) {
    state.room.push({ ...user })
  },

  // docDataScore配列を元にtotalScoreを計算、50点を越えるたびに25点にする
  setTotalScore(state, { docDataScore }) {
    state.totalScore = 0

    if (docDataScore.length >= 1) {
      docDataScore.forEach(s => {
        state.totalScore += s

        if (state.totalScore > 50) {
          state.totalScore = 25
        }
      })
    }
  },

  clearUsers(state) {
    state.users = []
  },

  showWLDialog(state) {
    state.showWLDialog = true
  },

  closeWLDialog(state) {
    state.showWLDialog = false
  },

  clear(state) {
    state.room = []
    state.users = []
    state.totalScore = 0
    state.startSecondHalf = false
    state.showWLDialog = false
  },
  startSecondHalf(state) {
    state.startSecondHalf = true
  },
}

export const actions = {
  // ルームに入室しているユーザー（主にスコア）をリアルタイムで監視する
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

  // users配列（順番）をリアルタイムで監視する
  subscribeRoom({ dispatch, commit }, { roomId }) {
    return this.$firestore
      .collection('rooms')
      .doc(roomId)
      .onSnapshot(
        {
          includeMetadataChanges: true,
        },
        doc => {
          const docData = doc.data()
          const users = docData.users
          commit('addUser', { users })

          if(docData.finishSecondHalf) {
            commit('showWLDialog')
            return
          } else if (docData.startSecondHalf) {
            commit('closeWLDialog')
            commit('startSecondHalf')
            return;
          } else if(docData.finishFirstHalf) {
            commit('showWLDialog')
            dispatch('clearUsers')
            // commit('clearUsers')
            return
          }
        },
      )
  },

  // 前半終了後に順番を表すusersをリセットする
  clearUsers({ commit }, { roomId }) {
    this.$firestore
    .collection('rooms')
    .doc(roomId)
    .update({
      users: []
    })
    .then(() => {
      commit('clearUsers')
    })
  },

  // game.vueが最初に表示される時に取得する
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

  // 毎回users配列の先頭を消去し、次のユーザーに順番が回ってくるようにする
  shiftUser({}, { roomId }) {
    this.$firestore
      .collection('rooms')
      .doc(roomId)
      .get()
      .then(doc => {
        const docData = doc.data()
        const docDataUsers = docData.users
        docDataUsers.shift()

        this.$firestore
          .collection('rooms')
          .doc(roomId)
          .update({
            users: docDataUsers,
          })
      })
  },

  // 自分のidをusersにpushし、自分の順番が再度戻ってくるようにする
  // 失格している場合は実行されない
  pushUser({}, { userId, roomId }) {
    this.$firestore
      .collection('rooms')
      .doc(roomId)
      .get()
      .then(doc => {
        const docData = doc.data()
        const docDataUsers = docData.users
        docDataUsers.push(userId)

        this.$firestore
          .collection('rooms')
          .doc(roomId)
          .update({
            users: docDataUsers,
          })
      })
  },

  // scoreにスコアを記録後、失格の判定や合計点の計算を実行
  setScore({ dispatch }, { score, userId, roomId }) {
    this.$firestore
      .collection('rooms')
      .doc(roomId)
      .collection('room')
      .doc(userId)
      .get()
      .then(doc => {
        const docData = doc.data()
        docData.score.push(score)
        this.$firestore
          .collection('rooms')
          .doc(roomId)
          .collection('room')
          .doc(userId)
          .update({
            score: docData.score,
          })
      })
      .then(() => {
        // dispatch('setTotalScore', { userId, roomId })
        dispatch('eliminateUser', { userId, roomId })
      })
      .then(() => {
        dispatch('setTotalScore', { userId, roomId })
        // dispatch('eliminateUser', { userId, roomId })
      })
  },

  // score配列を元にtotalScoresを計算
  setTotalScore({ commit, state }, { userId, roomId }) {
    this.$firestore
      .collection('rooms')
      .doc(roomId)
      .collection('room')
      .doc(userId)
      .get()
      .then(doc => {
        const docData = doc.data()
        const docDataScore = docData.score
        commit('setTotalScore', { docDataScore })

        this.$firestore
          .collection('rooms')
          .doc(roomId)
          .collection('room')
          .doc(userId)
          .update({
            totalScore: state.totalScore,
          })

        // 50点に到達すれば、その時点でゲームを終了させる
          if (state.totalScore === 50) {
            this.$firestore
              .collection('rooms')
              .doc(roomId)
              .update({
                finishFirstHalf: true,
                finishSecondHalf: true,
                users: [],
              })
          }
      })
  },

  // 失格の判定を行う
  // 自分が失格であればdispatch('shiftUser')のみを実行し、順番が回ってこないようにする
  eliminateUser({ dispatch, state }, { userId, roomId }) {
    dispatch('shiftUser', { roomId })
    this.$firestore
      .collection('rooms')
      .doc(roomId)
      .collection('room')
      .doc(userId)
      .get()
      .then(doc => {
        const docData = doc.data()
        const docDataScore = docData.score
        const index = docDataScore.lastIndexOf(0)

        if (
          docDataScore[index - 1] === 0 &&
          docDataScore[index - 2] === 0 &&
          index !== -1
        ) {
          this.$firestore
            .collection('rooms')
            .doc(roomId)
            .collection('room')
            .doc(userId)
            .update({
              elimination: true,
            })

          return
        } else {
          // 失格じゃなければusersに追加し、ゲームを続行させる
          dispatch('pushUser', { userId, roomId })
        }
      })
      // 1人を除き、失格になればゲームを終了させる
      .then(() => {
        this.$firestore
          .collection('rooms')
          .doc(roomId)
          .collection('room')
          .where('elimination', '==', false)
          .get()
          .then(snapshot => {
            if (snapshot.size === 1) {
              this.$firestore
                .collection('rooms')
                .doc(roomId)
                .update({
                  finishFirstHalf: true,
                  finishSecondHalf: true,
                  users: [],
                })
            }
          })
      })
  },
  startSecondHalf({ state, commit }, { roomId }) {
    commit('clearUsers')
    this.$firestore
      .collection('rooms')
      .doc(roomId)
      .collection('room')
      .orderBy('totalScore', 'desc')
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          const docData = doc.data()
          commit('pushUser', { users: docData.id })

          this.$firestore
            .collection('rooms')
            .doc(roomId)
            .collection('room')
            .doc(docData.id)
            .update({
              firstHalfScore: docData.totalScore,
              score: [],
              totalScore: 0,
              elimination: false,
            })
            // .then(() => {
              //   this.$firestore
              //     .collection('rooms')
              //     .doc(roomId)
              //     .update({
                //       users: state.users,
                //       finishFirstHalf: false,
                //     })
                // })
              }) 
            })
            .then(() => {
              this.$firestore
              .collection('rooms')
              .doc(roomId)
              .update({
                startSecondHalf: true,
                finishSecondHalf: false,
                users: state.users,
            // finishFirstHalf: false,
          })
      })
  },

  clear({ commit }) {
    commit('clear')
  }
}
