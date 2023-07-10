import { describe, test, expect } from 'vitest'
import { getCurrentInning } from '../../modules/getCurrentInning'

describe('getCurrentInning', () => {
  test('最も長い2次元配列の長さが返されること', () => {
    const nestedArray = [
      [7, 9, 8],
      [5, 11, 12, 6],
      [3, 10, 4],
      [1, 2],
    ]
    const result = getCurrentInning(nestedArray)
    expect(result).toBe(4)
  })

  test('全ての2次元配列の長さが同じ場合に、長さに1加えた数が返されること', () => {
    const nestedArray = [
      [7, 9, 8],
      [5, 11, 12],
      [3, 10, 4],
      [1, 2, 6],
    ]
    const result = getCurrentInning(nestedArray)
    expect(result).toBe(4)
  })

  test('空の2次元配列の場合、1が返されること', () => {
    const nestedArray: number[][] = []
    const result = getCurrentInning(nestedArray)
    expect(result).toBe(1)
  })

  test('全ての2次元配列が空の場合、1が返されること', () => {
    const nestedArray = [[], [], []]
    const result = getCurrentInning(nestedArray)
    expect(result).toBe(1)
  })
})
