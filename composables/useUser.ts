import { useState, useNuxtApp } from '#app'
import { doc, getDoc } from 'firebase/firestore'
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { User } from '../types/api'

// TODO: 型修正
type ApiResponse = {
  success: boolean
  error: any
}

export const useUser = () => {
  const { $fireAuth, $firestore } = useNuxtApp()
  const loginedUser = useState<User | null>('loginedUser', () => null)

  const getUser = async (uid: string): Promise<ApiResponse> => {
    try {
      const userSnapshot = await getDoc(doc($firestore, 'users', uid))
      if (userSnapshot.exists()) {
        loginedUser.value = { ...userSnapshot.data(), id: uid } as User
      } else {
        loginedUser.value = {
          name: '',
          iconImageUrl: '',
          stars: 0,
          id: uid,
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
      const googleAuthProvider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(
        $fireAuth,
        googleAuthProvider
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

  const guestLogin = async (
    email: string,
    password: string
  ): Promise<ApiResponse> => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        $fireAuth,
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
      await signOut($fireAuth)
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
      onAuthStateChanged(
        $fireAuth,
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
