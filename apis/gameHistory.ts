import { useNuxtApp } from '#app'
import {
  query,
  collection,
  orderBy,
  limit,
  setDoc,
  doc,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
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
      const gamesSnapshot = await getDocs(
        query(
          collection($firestore, 'users', userId, 'games'),
          orderBy('createdAt', 'desc'),
          limit(15)
        )
      )

      const promises = gamesSnapshot.docs.map(async (doc, index) => {
        const { createdAt } = doc.data()
        data.push({ createdAt, users: [] })

        const usersSnapshot = await getDocs(collection(doc.ref, 'game'))

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
    const { $firestore } = useNuxtApp()
    try {
      const gameRef = doc(collection($firestore, 'users', userId, 'games'))

      await setDoc(gameRef, {
        createdAt: serverTimestamp(),
      })
      const promises = users.map(async (user) => {
        await setDoc(doc(gameRef, 'game', user.id), user)
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
