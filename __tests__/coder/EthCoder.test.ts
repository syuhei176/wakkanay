import ethers from 'ethers'
import EthCoder, { getEthParamType } from '../../src/coder/EthCoder'
import {
  Address,
  Bytes,
  Integer,
  List,
  Tuple,
  Struct
} from '../../src/types/Codables'

describe('EthCoder', () => {
  describe('encode', () => {
    test('encode struct', () => {
      const struct = Struct.from({
        num: Integer.from(5),
        addr: Address.from('0x0472ec0185ebb8202f3d4ddb0226998889663cf2'),
        greet: Bytes.fromString('hello')
      })

      expect(EthCoder.encode(struct)).toBe(
        '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000472ec0185ebb8202f3d4ddb0226998889663cf200000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000000568656c6c6f000000000000000000000000000000000000000000000000000000'
      )
    })

    test('encode tuple', () => {
      const tuple = Tuple.from([
        Integer.from(5),
        Address.from('0x0472ec0185ebb8202f3d4ddb0226998889663cf2'),
        Bytes.fromString('hello')
      ])

      expect(EthCoder.encode(tuple)).toBe(
        '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000050000000000000000000000000472ec0185ebb8202f3d4ddb0226998889663cf20000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000568656c6c6f000000000000000000000000000000000000000000000000000000'
      )
    })
  })

  describe('decode', () => {
    test('decode struct', () => {
      EthCoder.decode(Integer, v)
      const b =
        '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000472ec0185ebb8202f3d4ddb0226998889663cf200000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000000568656c6c6f000000000000000000000000000000000000000000000000000000'
      const t = [
        {
          type: 'tuple',
          components: [
            { type: 'address', name: 'addr' },
            { type: 'bytes', name: 'greet' },
            { type: 'uint256', name: 'num' }
          ]
        }
      ]

      expect(EthCoder.decode(t, b)).toStrictEqual({
        num: 5,
        addr: '0x0472ec0185ebb8202f3d4ddb0226998889663cf2',
        greet: new Uint8Array([104, 101, 108, 108, 111])
      })
    })

    test.todo('decode tuple')
  })

  describe('getEthParamType()', () => {
    test('getEthParamType for Tuple', () => {
      const tuple = Tuple.from([
        Integer.default(),
        Address.default(),
        Bytes.default()
      ])

      expect(getEthParamType(tuple)).toStrictEqual({
        type: 'tuple',
        components: [
          { type: 'uint256', name: '0' },
          { type: 'address', name: '1' },
          { type: 'bytes', name: '2' }
        ]
      })
    })

    test('getEthParamType for nested Tuple', () => {
      const tuple = Tuple.from([
        Tuple.from([Integer.default()]),
        Integer.default(),
        Address.default(),
        Bytes.default()
      ])

      expect(getEthParamType(tuple)).toStrictEqual({
        type: 'tuple',
        components: [
          {
            type: 'tuple',
            name: '0',
            components: [{ type: 'uint256', name: '0' }]
          },
          { type: 'uint256', name: '1' },
          { type: 'address', name: '2' },
          { type: 'bytes', name: '3' }
        ]
      })
    })

    test('getEthParamType for Struct', () => {
      const struct = Struct.from({
        num: Integer.default(),
        addr: Address.default(),
        greet: Bytes.default()
      })

      expect(getEthParamType(struct)).toStrictEqual({
        type: 'tuple',
        components: [
          { type: 'address', name: 'addr' },
          { type: 'bytes', name: 'greet' },
          { type: 'uint256', name: 'num' }
        ]
      })
    })

    test('getEthParamType for nested Struct', () => {
      const struct = Struct.from({
        from: Struct.from({
          addr: Address.default()
        }),
        num: Integer.default(),
        addr: Address.default(),
        greet: Bytes.default()
      })

      expect(getEthParamType(struct)).toStrictEqual({
        type: 'tuple',
        components: [
          { type: 'address', name: 'addr' },
          {
            type: 'tuple',
            name: 'from',
            components: [
              {
                type: 'address',
                name: 'addr'
              }
            ]
          },
          { type: 'bytes', name: 'greet' },
          { type: 'uint256', name: 'num' }
        ]
      })
    })
  })
})
