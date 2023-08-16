import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from 'firebase/firestore'

/**
 * カスタムFirestoreデータコンバーター
 */
export type Converter<T extends { id: string }> = {
  fromFirestore(
    snapshot: QueryDocumentSnapshot<Omit<T, 'id'>>,
    options?: SnapshotOptions
  ): T
  toFirestore(model: T): DocumentData
}
