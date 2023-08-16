import { User } from '../../../types/api'
import { Converter } from '../../../types/firestoreDataConverter'
import { mergeId, removeId } from '../utils'

export const userConverter: Converter<User> = {
  fromFirestore(snapshot, options) {
    return mergeId(snapshot.data(options), snapshot.id)
  },
  toFirestore(model) {
    return removeId(model)
  },
}
