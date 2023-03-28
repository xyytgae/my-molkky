import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'

export const useGameStore = defineStore('game', {
  state: () => ({
    room: [],
    users: [],
    totalScore: 0,
    showWLDialog: false,
    isStartSecondHalf: false,
  }),
  getters: {
    getterRoom: (state) => state.room,
    getterUsers: (state) => state.users,
    getterShowWLDialog: (state) => state.showWLDialog,
    getterStartSecondHalf: (state) => state.isStartSecondHalf,
  },
  actions: {
    // ルームに入室しているユーザー（主にスコア）をリアルタイムで監視する
    subscribe({ roomId }) {
      return useNuxtApp()
        .$firestore.collection('rooms')
        .doc(roomId)
        .collection('room')
        .orderBy('order', 'asc')
        .onSnapshot((roomSnapshot) => {
          roomSnapshot.docChanges().forEach((snapshot) => {
            const docData = snapshot.doc.data()
            const room = {
              id: snapshot.doc.id,
              ...docData,
            }
            switch (snapshot.type) {
              case 'added':
                const isNotAdded = !this.room.find((r) => r.id === room.id)
                if (isNotAdded) {
                  this.room.push(room)
                }
                break

              case 'modified':
                this.room = this.room.map((r) => {
                  if (r.id === room.id) {
                    r = room
                  }
                  return r
                })
                break

              case 'removed':
                this.room = this.room.filter((r) => r.id !== room.id)
                break
            }
          })
        })
    },

    // users配列（順番）をリアルタイムで監視する
    subscribeRoom({ roomId }) {
      return useNuxtApp()
        .$firestore.collection('rooms')
        .doc(roomId)
        .onSnapshot(
          {
            includeMetadataChanges: true,
          },
          (doc) => {
            const docData = doc.data()
            const users = docData.users
            this.users = users

            if (docData.finishSecondHalf) {
              this.showWLDialog = true
              return
            } else if (docData.startSecondHalf) {
              this.showWLDialog = false
              this.isStartSecondHalf = true
              return
            } else if (docData.finishFirstHalf) {
              this.showWLDialog = true
              this.clearUsers()
              return
            }
          }
        )
    },

    // 前半終了後に順番を表すusersをリセットする
    clearUsers({ roomId }) {
      useNuxtApp()
        .$firestore.collection('rooms')
        .doc(roomId)
        .update({
          users: [],
        })
        .then(() => {
          this.users = []
        })
    },

    // game.vueが最初に表示される時に取得する
    getUser({ roomId }) {
      useNuxtApp()
        .$firestore.collection('rooms')
        .doc(roomId)
        .collection('room')
        .orderBy('order')
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            const data = doc.data()
            const user = {
              ...data,
            }
            this.room.push({ ...user })
          })
        })
    },

    // 毎回users配列の先頭を消去し、次のユーザーに順番が回ってくるようにする
    shiftUser({ roomId }) {
      useNuxtApp()
        .$firestore.collection('rooms')
        .doc(roomId)
        .get()
        .then((doc) => {
          const docData = doc.data()
          const docDataUsers = docData.users
          docDataUsers.shift()

          useNuxtApp().$firestore.collection('rooms').doc(roomId).update({
            users: docDataUsers,
          })
        })
    },

    // 自分のidをusersにpushし、自分の順番が再度戻ってくるようにする
    // 失格している場合は実行されない
    pushUser({ userId, roomId }) {
      useNuxtApp()
        .$firestore.collection('rooms')
        .doc(roomId)
        .get()
        .then((doc) => {
          const docData = doc.data()
          const docDataUsers = docData.users
          docDataUsers.push(userId)

          useNuxtApp().$firestore.collection('rooms').doc(roomId).update({
            users: docDataUsers,
          })
        })
    },

    // scoreにスコアを記録後、失格の判定や合計点の計算を実行
    setScore({ score, userId, roomId }) {
      useNuxtApp()
        .$firestore.collection('rooms')
        .doc(roomId)
        .collection('room')
        .doc(userId)
        .get()
        .then((doc) => {
          const docData = doc.data()
          docData.score.push(score)
          useNuxtApp()
            .$firestore.collection('rooms')
            .doc(roomId)
            .collection('room')
            .doc(userId)
            .update({
              score: docData.score,
            })
        })
        .then(() => {
          this.eliminateUser({ userId, roomId })
        })
        .then(() => {
          this.setTotalScore({ userId, roomId })
        })
    },

    // score配列を元にtotalScoresを計算
    setTotalScore({ userId, roomId }) {
      useNuxtApp()
        .$firestore.collection('rooms')
        .doc(roomId)
        .collection('room')
        .doc(userId)
        .get()
        .then((doc) => {
          const docData = doc.data()
          const docDataScore = docData.score

          // docDataScore配列を元にtotalScoreを計算、50点を越えるたびに25点にする
          this.totalScore = 0
          if (docDataScore.length >= 1) {
            docDataScore.forEach((s) => {
              this.totalScore += s
              if (this.totalScore > 50) {
                this.totalScore = 25
              }
            })
          }

          const firstHalfScore = docData.firstHalfScore

          useNuxtApp()
            .$firestore.collection('rooms')
            .doc(roomId)
            .collection('room')
            .doc(userId)
            .update({
              totalScore: this.totalScore,
              sum: firstHalfScore + this.totalScore,
            })

          // 50点に到達すれば、その時点でゲームを終了させる
          if (this.totalScore === 50) {
            useNuxtApp().$firestore.collection('rooms').doc(roomId).update({
              finishFirstHalf: true,
              finishSecondHalf: true,
              users: [],
            })
          }
        })
    },

    // 失格の判定を行う
    // 自分が失格であればthis.shiftUser({ roomId })のみを実行し、順番が回ってこないようにする
    eliminateUser({ userId, roomId }) {
      this.shiftUser({ roomId })

      useNuxtApp()
        .$firestore.collection('rooms')
        .doc(roomId)
        .collection('room')
        .doc(userId)
        .get()
        .then((doc) => {
          const docData = doc.data()
          const docDataScore = docData.score
          const index = docDataScore.lastIndexOf(0)

          if (
            docDataScore[index - 1] === 0 &&
            docDataScore[index - 2] === 0 &&
            index !== -1
          ) {
            useNuxtApp()
              .$firestore.collection('rooms')
              .doc(roomId)
              .collection('room')
              .doc(userId)
              .update({
                elimination: true,
              })

            return
          } else {
            // 失格じゃなければusersに追加し、ゲームを続行させる
            this.pushUser({ userId, roomId })
          }
        })
        // 1人を除き、失格になればゲームを終了させる
        .then(() => {
          useNuxtApp()
            .$firestore.collection('rooms')
            .doc(roomId)
            .collection('room')
            .where('elimination', '==', false)
            .get()
            .then((snapshot) => {
              if (snapshot.size === 1) {
                useNuxtApp().$firestore.collection('rooms').doc(roomId).update({
                  finishFirstHalf: true,
                  finishSecondHalf: true,
                  users: [],
                })
              }
            })
        })
    },
    startSecondHalf({ roomId }) {
      this.users = []
      useNuxtApp()
        .$firestore.collection('rooms')
        .doc(roomId)
        .collection('room')
        .orderBy('totalScore', 'desc')
        .get()
        .then((snapshot) => {
          snapshot.forEach((doc) => {
            const docData = doc.data()
            this.users.push(docData.id)

            useNuxtApp()
              .$firestore.collection('rooms')
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
            //   useNuxtApp().$firestore
            //     .collection('rooms')
            //     .doc(roomId)
            //     .update({
            //       users: this.users,
            //       finishFirstHalf: false,
            //     })
            // })
          })
        })
        .then(() => {
          useNuxtApp().$firestore.collection('rooms').doc(roomId).update({
            startSecondHalf: true,
            finishSecondHalf: false,
            users: this.users,
            // finishFirstHalf: false,
          })
        })
    },

    closeWLDialog() {
      this.showWLDialog = false
    },

    clear() {
      this.room = []
      this.users = []
      this.totalScore = 0
      this.isStartSecondHalf = false
      this.showWLDialog = false
    },
  },
})
