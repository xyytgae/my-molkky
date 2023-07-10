/**
 * イニングの最大数を取得する
 * @param usersScores
 * @returns
 */
export const getCurrentInning = (usersScores: number[][]): number => {
  if (usersScores.length < 1) return 1
  const inningLengths = usersScores.map((userScores) => userScores.length)
  const sortedInningLengths = inningLengths.sort((a, b) => b - a)

  // 最初の要素と最後の要素が同じでない場合、最初の要素を返す
  const isFirstAndLastEqual =
    sortedInningLengths[0] ===
    sortedInningLengths[sortedInningLengths.length - 1]

  return isFirstAndLastEqual
    ? sortedInningLengths[0] + 1
    : sortedInningLengths[0]
}
