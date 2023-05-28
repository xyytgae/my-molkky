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

export type Room = {
  id: string
  hostId: string
  name: string
  password: string
  topImageUrl: string
  createdAt: firestore.Timestamp
  startSecondHalf: boolean
  startFirstHalf: boolean
  finishFirstHalf: boolean
  finishSecondHalf: boolean
  delete: boolean
  users: Array<string>
}
