import { useNuxtApp } from '#app'
import { setDoc, doc, updateDoc, increment } from 'firebase/firestore'
import { ApiResponse, User, UpdateUserInput } from '../types/api'
import { userConverter } from '~/modules/firestoreDataConverter/models/user'

export const userRepo = {
  /**
   * ユーザーを作成する
   * @param userId
   * @param input
   * @returns
   */
  create: async ({
    userId,
    input,
  }: {
    userId: string
    input: User
  }): Promise<ApiResponse<string | null>> => {
    const { $firestore } = useNuxtApp()
    try {
      await setDoc(
        doc($firestore, 'users', userId).withConverter(userConverter),
        input
      )

      return {
        data: userId,
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
  /**
   * ユーザーを更新する
   * @param userId
   * @param input
   * @returns
   */
  update: async ({
    userId,
    input,
  }: {
    userId: string
    input: UpdateUserInput
  }): Promise<ApiResponse<string | null>> => {
    const { $firestore } = useNuxtApp()
    try {
      const { name, iconImageUrl, stars } = input
      await updateDoc(doc($firestore, 'users', userId), {
        name,
        iconImageUrl,
        stars,
      })

      return {
        data: userId,
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
  /**
   * ユーザーのstarを増やす
   * @param userId
   * @returns
   */
  incrementStars: async ({ userId }: { userId: string }) => {
    const { $firestore } = useNuxtApp()
    try {
      await updateDoc(doc($firestore, 'users', userId), {
        stars: increment(1),
        // stones: increment(1),
      })

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
