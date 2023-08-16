import { Timestamp, FieldValue } from 'firebase/firestore'

export type ApiResponse<T> = {
  data: T
  success: boolean
  error: any
}

/**
 * ユーザー
 */
export type UpdateUserInput = {
  name: string
  iconImageUrl: string
  stars: number
}

export type User = {
  id: string
  name: string
  iconImageUrl: string
  stars: number
}

/**
 * プレイヤー
 */
export type Player = {
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
