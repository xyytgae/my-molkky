import { Converter } from '../../../types/firestoreDataConverter'
import { Player } from '../../../types/api'
import { mergeId, removeId } from '../utils'

export const playerConverter: Converter<Player> = {
  fromFirestore(snapshot, options) {
    return mergeId(snapshot.data(options), snapshot.id)
  },
  toFirestore(model) {
    return removeId(model)
  },
}
