import { useNuxtApp } from '#app'
import { ApiResponse, User, PlayingUser } from '../types/api'
import { firestore } from 'firebase'

const createDefaultUser = (
  user: User,
  createdAt: firestore.FieldValue
): PlayingUser => ({
  score: [],
  firstHalfScore: 0,
  totalScore: 0,
  elimination: false,
  order: 0,
  stars: user.stars,
  id: user.uid,
  name: user.name,
  iconImageUrl: user.iconImageUrl,
  createdAt,
})

export const waitingUsersRepo = {
  createUser: async (
    user: User,
    roomId: string
  ): Promise<ApiResponse<User | null>> => {
    const { $firestore, $firebase } = useNuxtApp()
    const createdAt = $firebase.firestore.FieldValue.serverTimestamp()
    const addedUser = createDefaultUser(user, createdAt)

    try {
      await $firestore
        .collection('rooms')
        .doc(roomId)
        .collection('room')
        .doc(user.uid)
        .set(addedUser)

      return {
        data: user,
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
  deleteUser: async (userId: string, roomId: string) => {
    const { $firestore } = useNuxtApp()

    try {
      await $firestore
        .collection('rooms')
        .doc(roomId)
        .collection('room')
        .doc(userId)
        .delete()

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

  updateOrder: async (userIds: string[], roomId: string) => {
    const { $firestore } = useNuxtApp()

    try {
      const promises = userIds.map(async (userId, index) => {
        await $firestore
          .collection('rooms')
          .doc(roomId)
          .collection('room')
          .doc(userId)
          .update({
            order: index,
          })
      })

      await Promise.all(promises)
      await $firestore.collection('rooms').doc(roomId).update({
        users: userIds,
      })

      return {
        data: userIds,
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
