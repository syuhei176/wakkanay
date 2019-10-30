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
    test.todo('encode struct')
    test.todo('encode tuple')
  })

  describe('decode', () => {
    test.todo('decode struct')
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
