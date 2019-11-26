import { Range } from '../../../src/types/types'
import { Integer, Struct } from '../../../src/types/Codables'

describe('Range', () => {
  const start = Integer.from(10)
  const end = Integer.from(12)
  describe('toStruct', () => {
    it('return struct', async () => {
      const range = new Range(start, end)
      const struct = range.toStruct()
      expect(struct).toStrictEqual(Struct.from({ start: start, end: end }))
    })
  })
  describe('fromStruct', () => {
    it('return struct', async () => {
      const range = Range.fromStruct(Struct.from({ start: start, end: end }))
      expect(range).toStrictEqual(new Range(start, end))
    })
  })
})
