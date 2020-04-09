import { FixedBytes } from '../src'

describe('FixedBytes', () => {
  describe('fromHexString', () => {
    test('create Bytes from hex string', () => {
      const hex = '0x0000'
      const h = FixedBytes.fromHexString(2, hex)
      expect(h.data).toEqual(Uint8Array.from([0, 0]))
    })

    test('fail to create FixedBytes from unmatched size', () => {
      const hex = '0x121212'
      expect(() => {
        FixedBytes.fromHexString(5, hex)
      }).toThrow(new Error('data size does not match. expect 5, received 3'))
    })

    test('fail to create FixedBytes from invalid hex string', () => {
      const hex = '0x00G1234567'
      expect(() => {
        FixedBytes.fromHexString(5, hex)
      }).toThrow(new Error('invalid hex string'))
    })

    test('fail to create FixedBytes with more than 33 size', () => {
      const hex =
        '0xef583c07cae62e3a002a9ad558064ae80db17162801132f9327e8bb6da16ea8a12'
      expect(() => {
        FixedBytes.fromHexString(33, hex)
      }).toThrow(new Error('data size must be smaller than or equal to 32'))
    })
  })

  describe('toHexString', () => {
    test('FixedBytes to hex string', () => {
      const array = [0, 18, 52, 86, 120]
      const h = FixedBytes.from(5, Uint8Array.from(array))
      expect(h.toHexString()).toBe('0x0012345678')
    })
  })

  describe('equals', () => {
    const x = FixedBytes.fromHexString(2, '0x0000')
    const y = FixedBytes.fromHexString(2, '0x0001')

    test('succeed to equals', () => {
      expect(x.equals(x)).toBeTruthy()
    })
    test('fail to equals', () => {
      expect(x.equals(y)).toBeFalsy()
    })
  })
})
