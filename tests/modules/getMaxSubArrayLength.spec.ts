import { describe, test, expect } from 'vitest'
import { getMaxSubArrayLength } from '../../modules/getMaxSubArrayLength'

describe('getMaxSubArrayLength', () => {
  test('最も長いサブ配列の長さが返されること', () => {
    const nestedArray = [
      [7, 9, 8],
      [5, 11, 12, 6],
      [3, 10, 4],
      [1, 2],
    ]
    const result = getMaxSubArrayLength(nestedArray)
    expect(result).toBe(4)
  })

  test('空の2次元配列の場合、0が返されること', () => {
    const nestedArray: number[][] = []
    const result = getMaxSubArrayLength(nestedArray)
    expect(result).toBe(0)
  })

  test('全てのサブ配列が空の場合、0が返されること', () => {
    const nestedArray = [[], [], []]
    const result = getMaxSubArrayLength(nestedArray)
    expect(result).toBe(0)
  })
})
