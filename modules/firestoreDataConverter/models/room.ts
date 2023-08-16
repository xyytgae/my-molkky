import { Converter } from '../../../types/firestoreDataConverter'
import { Room } from '../../../types/api'
import { mergeId, removeId } from '../utils'

export const roomConverter: Converter<Room> = {
  fromFirestore(snapshot, options) {
    return mergeId(snapshot.data(options), snapshot.id)
  },
  toFirestore(model) {
    return removeId(model)
  },
}
