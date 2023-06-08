/**
 * 2次元配列から最大の配列の長さを取得する
 * @param nestedArray
 * @returns
 */

export const getMaxSubArrayLength = (nestedArray: number[][]): number => {
  const arrayLengths = nestedArray.map((subArray) => subArray.length)
  return Math.max(...arrayLengths)
}
