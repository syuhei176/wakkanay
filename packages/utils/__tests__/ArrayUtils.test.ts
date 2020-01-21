import { ArrayUtils } from '../src'

describe('ArrayUtils', () => {
  describe('chunk', () => {
    it('return 2 chunk', async () => {
      const chunk = ArrayUtils.chunk([1, 2, 3, 4, 5, 6], 2)
      expect(chunk).toStrictEqual([
        [1, 2],
        [3, 4],
        [5, 6]
      ])
    })
    it('return 2 chunk from odd array', async () => {
      const chunk = ArrayUtils.chunk([1, 2, 3, 4, 5], 2)
      expect(chunk).toStrictEqual([[1, 2], [3, 4], [5]])
    })
    it('return 3 chunk', async () => {
      const chunk = ArrayUtils.chunk([1, 2, 3, 4, 5], 3)
      expect(chunk).toStrictEqual([
        [1, 2, 3],
        [4, 5]
      ])
    })
    it('from empty', async () => {
      const chunk = ArrayUtils.chunk([], 2)
      expect(chunk).toStrictEqual([])
    })
  })
})
