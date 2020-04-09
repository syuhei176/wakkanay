import { BigNumber } from '../src'

describe('BigNumber', () => {
  describe('from', () => {
    it('from string', async () => {
      expect(BigNumber.fromString('10000')).toStrictEqual(BigNumber.from(10000))
    })
    it('from hex string', async () => {
      expect(BigNumber.fromHexString('0x10000')).toStrictEqual(
        BigNumber.from(65536)
      )
    })
    it('from b string', async () => {
      expect(BigNumber.fromString('0b10000')).toStrictEqual(BigNumber.from(16))
    })
  })

  describe('toHexString', () => {
    it('to 0x00', async () => {
      const num = BigNumber.from(0)
      expect(num.toHexString()).toStrictEqual('0x00')
    })
    it('to 0x10', async () => {
      const num = BigNumber.fromHexString('0x10')
      expect(num.toHexString()).toStrictEqual('0x10')
    })
    it('to 0123', async () => {
      const num = BigNumber.fromHexString('0x123')
      expect(num.toHexString(false)).toStrictEqual('0123')
    })
  })

  describe('equals', () => {
    const x = BigNumber.from(1)
    const y = BigNumber.from(10)

    it('succeed to equals', () => {
      expect(x.equals(x)).toBeTruthy()
    })
    it('fail to equals', () => {
      expect(x.equals(y)).toBeFalsy()
    })
  })
})
