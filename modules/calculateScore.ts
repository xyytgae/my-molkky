/**
 * スコアを計算する
 * 50点を越えるたびに25点にする
 * @param scores
 * @returns
 */
export const calculateScore = (scores: number[]): number => {
  let totalScore = 0
  if (scores.length === 0) return totalScore
  scores.forEach((score) => {
    totalScore += score
    if (totalScore > 50) {
      totalScore = 25
    }
  })
  return totalScore
}
