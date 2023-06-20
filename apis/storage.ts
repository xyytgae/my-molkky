import { useNuxtApp } from '#app'
import { ApiResponse } from '../types/api'

export const storageRepo = {
  /**
   * 画像をアップロードする
   * @param file
   * @param path
   * @returns
   */
  upload: async ({
    file,
    path,
  }: {
    file: File
    path: string
  }): Promise<ApiResponse<string>> => {
    const { $fireStorage } = useNuxtApp()
    try {
      const imageRef = await $fireStorage.ref().child(`images/${path}`)
      const snapshot = await imageRef.put(file)
      const url = await snapshot.ref.getDownloadURL()

      return {
        data: url,
        success: true,
        error: null,
      }
    } catch (error) {
      return {
        data: '',
        success: false,
        error,
      }
    }
  },
}
