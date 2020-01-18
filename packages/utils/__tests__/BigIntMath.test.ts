import { BigIntMath } from '../src'

describe('BigIntMath', () => {
  describe('max', () => {
    it('return max bigint from 2 bigints', () => {
      expect(BigIntMath.max(BigInt(1000), BigInt(1000000))).toEqual(
        BigInt(1000000)
      )
    })
  })
  describe('min', () => {
    it('return min bigint from 2 bigints', () => {
      expect(BigIntMath.min(BigInt(1000), BigInt(1000000))).toEqual(
        BigInt(1000)
      )
    })
  })
})
