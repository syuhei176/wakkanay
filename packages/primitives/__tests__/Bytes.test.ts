import { Bytes } from '../src'

describe('Bytes', () => {
  describe('equals', () => {
    const x = Bytes.fromHexString('0x0000')
    const y = Bytes.fromHexString('0x0001')

    test('succeed to equals', () => {
      expect(x.equals(x)).toBeTruthy()
    })
    test('fail to equals', () => {
      expect(x.equals(y)).toBeFalsy()
    })
  })
})
