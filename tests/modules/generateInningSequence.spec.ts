import { describe, test, expect } from 'vitest'
import { generateInningSequence } from '../../modules/generateInningSequence'

describe('generateInningSequence', () => {
  test('引数に9を渡して、最大値が9のイニングの配列が生成されること', () => {
    const result = generateInningSequence(9)
    expect(result).toEqual([6, 7, 8, 9])
  })

  test('引数に5を渡して、最大値が5のイニングの配列が生成されること', () => {
    const result = generateInningSequence(5)
    expect(result).toEqual([2, 3, 4, 5])
  })

  test('引数に1を渡して、最大値が4のイニングの配列が生成されること', () => {
    const result = generateInningSequence(1)
    expect(result).toEqual([1, 2, 3, 4])
  })

  test('引数に0を渡して、最大値が4のイニングの配列が生成されること', () => {
    const result = generateInningSequence(0)
    expect(result).toEqual([1, 2, 3, 4])
  })
})
