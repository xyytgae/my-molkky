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
  id: string
}

export type GameHistory = {
  createdAt: firestore.Timestamp
  users: Array<any>
}

export type RoomStatus =
  | 'NOT_STARTED'
  | 'FIRST_HALF_STARTED'
  | 'FIRST_HALF_FINISHED'
  | 'SECOND_HALF_STARTED'
  | 'SECOND_HALF_FINISHED'

export type CreateRoomInput = {
  hostId: string
  name: string
  password: string
  topImageUrl: string
  createdAt: firestore.Timestamp | firestore.FieldValue
  delete: boolean
  playerIds: Array<string>
  status: RoomStatus
}

export type Room = {
  id: string
} & CreateRoomInput

export type PlayingUser = {
  id: string
  order: number
  elimination: boolean
  iconImageUrl: string
  firstHalfScore: number
  secondHalfScore: number
  totalScore: number
  scores: Array<number>
  createdAt: firestore.Timestamp | firestore.FieldValue
  name: string
  stars: number
}
