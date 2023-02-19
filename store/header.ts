import { defineStore } from 'pinia'
import { useNuxtApp } from '#app'

export const useHeaderStore = defineStore('header', {
  state: () => ({
    roomData: null,
  }),
  getters: {
    getterRoomData: (state) => state.roomData,
  },
  actions: {
    getRoom({ roomId }) {
      useNuxtApp()
        .$firestore.collection('rooms')
        .doc(roomId)
        .get()
        .then((doc) => {
          const docData = doc.data()
          this.roomData = docData
        })
    },
  },
})
// export const state = () => ({
//   roomData: null,
// })

// export const getters = {
//   roomData: (state) => state.roomData,
// }

// export const mutations = {
//   getRoom(state, { docData }) {
//     state.roomData = docData
//   },
// }

// export const actions = {
//   getRoom({ commit }, { roomId }) {
//     useNuxtApp()
//       .$firestore.collection('rooms')
//       .doc(roomId)
//       .get()
//       .then((doc) => {
//         const docData = doc.data()
//         commit('getRoom', { docData })
//       })
//   },
// }
