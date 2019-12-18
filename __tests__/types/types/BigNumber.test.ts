import { BigNumber } from '../../../src/types/Codables'

describe('BigNumber', () => {
  describe('from', () => {
    it('from string', async () => {
      expect(BigNumber.from('10000')).toStrictEqual(BigNumber.from(10000))
    })
    it('from hex string', async () => {
      expect(BigNumber.from('0x10000')).toStrictEqual(BigNumber.from(65536))
    })
    it('from b string', async () => {
      expect(BigNumber.from('0b10000')).toStrictEqual(BigNumber.from(16))
    })
  })
})
