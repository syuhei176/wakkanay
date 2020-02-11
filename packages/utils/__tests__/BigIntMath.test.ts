import { BigIntMath } from '../src'
import JSBI from 'jsbi'

describe('JSBI.BigIntMath', () => {
  describe('max', () => {
    it('return max bigint from 2 bigints', () => {
      expect(BigIntMath.max(JSBI.BigInt(1000), JSBI.BigInt(1000000))).toEqual(
        JSBI.BigInt(1000000)
      )
    })
  })
  describe('min', () => {
    it('return min bigint from 2 bigints', () => {
      expect(BigIntMath.min(JSBI.BigInt(1000), JSBI.BigInt(1000000))).toEqual(
        JSBI.BigInt(1000)
      )
    })
  })
})
