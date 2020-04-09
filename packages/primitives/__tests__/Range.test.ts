import { BigNumber, Struct, Range } from '../src'
import JSBI from 'jsbi'

describe('Range', () => {
  const start = BigNumber.from(JSBI.BigInt(10))
  const end = BigNumber.from(JSBI.BigInt(12))
  describe('toStruct', () => {
    it('return struct', async () => {
      const range = new Range(start, end)
      const struct = range.toStruct()
      expect(struct).toStrictEqual(
        Struct.from([
          { key: 'start', value: start },
          { key: 'end', value: end }
        ])
      )
    })
  })

  describe('fromStruct', () => {
    it('return struct', async () => {
      const range = Range.fromStruct(
        Struct.from([
          { key: 'start', value: start },
          { key: 'end', value: end }
        ])
      )

      expect(range).toStrictEqual(new Range(start, end))
    })
  })

  describe('equals', () => {
    const x = new Range(BigNumber.from(0), BigNumber.from(10))
    const y = new Range(BigNumber.from(10), BigNumber.from(20))

    test('succeed to equals', () => {
      expect(x.equals(x)).toBeTruthy()
    })
    test('fail to equals', () => {
      expect(x.equals(y)).toBeFalsy()
    })
  })
})
