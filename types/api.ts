import { Timestamp, FieldValue } from 'firebase/firestore'

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
  createdAt: Timestamp | FieldValue
  name: string
  stars: number
}

export type Player = CreatePlayerInput

/**
 * ゲームヒストリー
 */
export type GameHistory = {
  createdAt: Timestamp
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
  createdAt: Timestamp | FieldValue
  delete: boolean
  playerIds: Array<string>
  status: RoomStatus
}

export type Room = {
  id: string
} & CreateRoomInput
