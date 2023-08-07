import { useNuxtApp } from '#app'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
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
      const imageRef = ref($fireStorage, `images/${path}`)
      const result = await uploadBytes(imageRef, file)
      const url = await getDownloadURL(result.ref)

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
