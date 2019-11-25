import { Bytes } from '../../src/types/Codables'

describe('Bytes', () => {
  describe('fromHexString', () => {
    test('create Bytes from hex string', () => {
      const hex = '0x0012345678'
      const h = Bytes.fromHexString(hex)
      expect(h.data).toEqual(Uint8Array.from([0, 18, 52, 86, 120]))
    })
    test('fail to create Bytes from invalid hex string', () => {
      const hex = '0x00G12345678'
      expect(() => {
        Bytes.fromHexString(hex)
      }).toThrow(new Error('invalid hex string'))
    })
  })
  describe('toHexString', () => {
    test('Bytes to hex string', () => {
      const array = [0, 18, 52, 86, 120]
      const h = Bytes.from(Uint8Array.from(array))
      expect(h.toHexString()).toBe('0x0012345678')
    })
  })
  describe('concat', () => {
    test('return concatenated bytes', () => {
      const b1 = Bytes.fromHexString('0x0101')
      const b2 = Bytes.fromHexString('0x0202')
      const b = Bytes.concat([b1, b2])
      expect(b.toHexString()).toBe('0x01010202')
    })
  })
  describe('equals', () => {
    test('return true', () => {
      const b1 = Bytes.fromHexString('0x010203')
      const b2 = Bytes.fromHexString('0x010203')
      expect(b1.equals(b2)).toBeTruthy()
    })
    test('return false', () => {
      const b1 = Bytes.fromHexString('0x010203')
      const b2 = Bytes.fromHexString('0x010204')
      expect(b1.equals(b2)).toBeFalsy()
    })
  })
})
