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
})
