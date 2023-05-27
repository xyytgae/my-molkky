import { useNuxtApp } from '#app'
import { ApiResponse, GameHistory } from '../types/api'

export const gameHistoryRepository = {
  get: async (uid: string): Promise<ApiResponse<GameHistory[]>> => {
    const { $firestore } = useNuxtApp()
    const data: GameHistory[] = []
    try {
      const gamesSnapshot = await $firestore
        .collection('users')
        .doc(uid)
        .collection('games')
        .orderBy('createdAt', 'desc')
        .limit(15)
        .get()

      const promises = gamesSnapshot.docs.map(async (doc, index) => {
        const { createdAt } = doc.data()
        data.push({ createdAt, users: [] })

        const usersSnapshot = await doc.ref
          .collection('game')
          .orderBy('sum', 'desc')
          .get()

        usersSnapshot.forEach((subDoc) => {
          data[index].users.push({ ...subDoc.data() })
        })
      })
      await Promise.all(promises)

      return {
        data,
        success: true,
        error: null,
      }
    } catch (error) {
      return {
        data: [],
        success: false,
        error,
      }
    }
  },
}
