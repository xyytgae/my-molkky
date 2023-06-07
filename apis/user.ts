import { useNuxtApp } from '#app'
import { ApiResponse, CreateUserInput } from '../types/api'

export const userRepository = {
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
    input: CreateUserInput
  }): Promise<ApiResponse<string | null>> => {
    const { $firestore } = useNuxtApp()
    try {
      await $firestore.collection('users').doc(userId).set({
        name: input.name,
        iconImageUrl: input.iconImageUrl,
        stars: input.stars,
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
}
