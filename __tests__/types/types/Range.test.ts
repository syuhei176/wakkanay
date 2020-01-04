import { Range } from '../../../src/types/types'
import { BigNumber, Struct } from '../../../src/types/Codables'

describe('Range', () => {
  const start = BigNumber.from(10n)
  const end = BigNumber.from(12n)
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
