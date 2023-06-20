import { useNuxtApp } from '#app'
import { ApiResponse, GameHistory, Player } from '../types/api'

export const gameHistoryRepo = {
  /**
   * ゲーム履歴を取得する
   * @param userId
   * @returns
   */
  get: async (userId: string): Promise<ApiResponse<GameHistory[]>> => {
    const { $firestore } = useNuxtApp()
    const data: GameHistory[] = []
    try {
      const gamesSnapshot = await $firestore
        .collection('users')
        .doc(userId)
        .collection('games')
        .orderBy('createdAt', 'desc')
        .limit(15)
        .get()

      const promises = gamesSnapshot.docs.map(async (doc, index) => {
        const { createdAt } = doc.data()
        data.push({ createdAt, users: [] })

        const usersSnapshot = await doc.ref.collection('game').get()

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
  /**
   * ゲーム履歴を作成する
   * @param userId
   * @param users
   * @returns
   */
  create: async (userId: string, users: Player[]) => {
    const { $firestore, $firebase } = useNuxtApp()
    try {
      const gameRef = await $firestore
        .collection('users')
        .doc(userId)
        .collection('games')
        .doc()

      await gameRef.set({
        createdAt: $firebase.firestore.FieldValue.serverTimestamp(),
      })

      const promises = users.map(async (user) => {
        await gameRef.collection('game').doc(user.id).set(user)
      })

      await Promise.all(promises)

      return {
        data: null,
        success: true,
        error: null,
      }
    } catch (error) {
      return {
        data: null,
        success: false,
        error,
      }
    }
  },
}
