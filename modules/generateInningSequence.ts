/**
 * イニングの配列を生成する
 * @param currentInning
 * @returns
 */
export const generateInningSequence = (currentInning: number): number[] => {
  const minInning = Math.max(currentInning - 3, 1)
  return [minInning, minInning + 1, minInning + 2, minInning + 3]
}
