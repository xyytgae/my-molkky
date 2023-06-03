import { describe, test, expect } from 'vitest'
import { calculateScore } from '../../modules/calculateScore'

describe('calculateScore', () => {
  test('スコアが50点以下の場合、合計スコアが正しく計算されること', () => {
    const scores = [10, 20, 15, 5]
    const expectedScore = 50 // 合計スコアは50点以下
    const result = calculateScore(scores)
    expect(result).toBe(expectedScore)
  })

  test('スコアが50点を越えるたびに、合計スコアが25点にリセットされること', () => {
    const scores = [10, 30, 20, 10]
    const expectedScore = 35 // 合計スコアが50点を越えると、25点にリセットされる
    const result = calculateScore(scores)
    expect(result).toBe(expectedScore)
  })

  test('スコアが空の配列の場合、合計スコアが0であること', () => {
    const scores: number[] = []
    const expectedScore = 0 // スコアが空の場合、合計スコアは0
    const result = calculateScore(scores)
    expect(result).toBe(expectedScore)
  })
})
