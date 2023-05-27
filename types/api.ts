import { firestore } from 'firebase'

export type ApiResponse<T> = {
  data: T
  success: boolean
  error: any
}

export type GameHistory = {
  createdAt: firestore.Timestamp
  users: Array<any>
}
