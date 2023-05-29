import { useState, useNuxtApp } from '#app'
import { User } from '../types/api'

// TODO: 型修正
type ApiResponse = {
  success: boolean
  error: any
}

export const useUser = () => {
  const { $firebase, $fireAuth, $firestore } = useNuxtApp()
  const loginedUser = useState<User | null>('loginedUser', () => null)

  const getUser = async (uid: string): Promise<ApiResponse> => {
    try {
      const userSnapshot = await $firestore.collection('users').doc(uid).get()
      if (userSnapshot.exists) {
        loginedUser.value = { ...userSnapshot.data(), uid } as User
      } else {
        loginedUser.value = {
          name: '',
          iconImageUrl: '',
          stars: 0,
          uid,
        }
      }

      return {
        success: true,
        error: null,
      }
    } catch (error) {
      return {
        success: false,
        error,
      }
    }
  }

  const googleLogin = async (): Promise<ApiResponse> => {
    try {
      const googleAuthProvider = new $firebase.auth.GoogleAuthProvider()
      const userCredential = await $fireAuth.signInWithPopup(googleAuthProvider)
      if (userCredential && userCredential.user) {
        await getUser(userCredential.user.uid)
      }

      return {
        success: true,
        error: null,
      }
    } catch (error) {
      return {
        success: false,
        error,
      }
    }
  }

  const guestLogin = async (
    email: string,
    password: string
  ): Promise<ApiResponse> => {
    try {
      const userCredential = await $fireAuth.signInWithEmailAndPassword(
        email,
        password
      )
      if (userCredential && userCredential.user) {
        await getUser(userCredential.user.uid)
      }

      return {
        success: true,
        error: null,
      }
    } catch (error) {
      return {
        success: false,
        error,
      }
    }
  }

  const logout = async (): Promise<ApiResponse> => {
    try {
      await $fireAuth.signOut()
      loginedUser.value = null

      return {
        success: true,
        error: null,
      }
    } catch (error) {
      return {
        success: false,
        error,
      }
    }
  }

  const checkAuthState = async (): Promise<void> => {
    return await new Promise<void>((resolve, reject) => {
      $fireAuth.onAuthStateChanged(
        async (user) => {
          if (user) {
            const { uid } = user
            await getUser(uid)
            resolve()
          } else {
            loginedUser.value = null
            resolve()
          }
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  return {
    loginedUser,
    getUser,
    googleLogin,
    guestLogin,
    logout,
    checkAuthState,
  }
}
