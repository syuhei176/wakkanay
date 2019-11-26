import { BigIntMath } from '../../src/utils'

describe('BigIntMath', () => {
  beforeEach(() => {})
  describe('max', () => {
    it('return max bigint from 2 bigints', () => {
      expect(BigIntMath.max(1000n, 1000000n)).toEqual(1000000n)
    })
  })
  describe('min', () => {
    it('return min bigint from 2 bigints', () => {
      expect(BigIntMath.min(1000n, 1000000n)).toEqual(1000n)
    })
  })
})
