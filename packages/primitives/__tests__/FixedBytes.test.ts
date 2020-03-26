import FixedBytes from '../src/FixedBytes'

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
  })

  describe('toHexString', () => {
    test('FixedBytes to hex string', () => {
      const array = [0, 18, 52, 86, 120]
      const h = FixedBytes.from(5, Uint8Array.from(array))
      expect(h.toHexString()).toBe('0x0012345678')
    })
  })
})
