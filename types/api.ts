import { firestore } from 'firebase'

export type ApiResponse<T> = {
  data: T
  success: boolean
  error: any
}

// TODO: 型修正
export type User = {
  name: string
  iconImageUrl: string
  stars: number
  uid: string
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

export type PlayingUser = {
  id: string
  order: number
  elimination: boolean
  iconImageUrl: string
  firstHalfScore: number
  totalScore: number
  score: Array<number>
  createdAt: firestore.Timestamp | firestore.FieldValue
  name: string
  stars: number
}
