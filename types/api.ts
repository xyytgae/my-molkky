import { firestore } from 'firebase'

export type ApiResponse<T> = {
  data: T
  success: boolean
  error: any
}

/**
 * ユーザー
 */
export type CreateUserInput = {
  name: string
  iconImageUrl: string
  stars: number
}

export type UpdateUserInput = {
  name: string
  iconImageUrl: string
  stars: number
}

export type User = {
  id: string
} & CreateUserInput

/**
 * プレイヤー
 */
export type CreatePlayerInput = {
  id: string
  order: number
  elimination: boolean
  iconImageUrl: string
  firstHalfScore: number
  secondHalfScore: number
  scores: Array<number>
  createdAt: firestore.Timestamp | firestore.FieldValue
  name: string
  stars: number
}

export type Player = CreatePlayerInput

/**
 * ゲームヒストリー
 */
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

/**
 * ルーム
 */
export type CreateRoomInput = {
  hostId: string
  name: string
  password: string
  createdAt: firestore.Timestamp | firestore.FieldValue
  delete: boolean
  playerIds: Array<string>
  status: RoomStatus
}

export type Room = {
  id: string
} & CreateRoomInput
