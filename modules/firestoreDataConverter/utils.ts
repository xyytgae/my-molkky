/**
 * modelにidを追加する
 * @param model
 * @param id
 */
export const mergeId = <T>(
  model: T,
  id: string
): T & {
  id: string
} => {
  return {
    ...model,
    id,
  }
}

/**
 * modelからidを削除する
 * @param model
 */
export const removeId = <T extends { id: string }>(model: T): Omit<T, 'id'> => {
  const { id: _id, ...rest } = model
  return rest
}
