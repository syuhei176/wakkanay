import EthCoder, {
  getEthTypeStringRep,
  getEthParamType
} from '../../src/coder/EthCoder'
import {
  Codable,
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

  describe('getEthTypeStringRep()', () => {
    test.todo('getEthTypeStringRep for Tuple')
    test.todo('getEthTypeStringRep for Struct')
  })

  describe('getEthParamType()', () => {
    test('getEthParamType for Tuple', () => {
      const tuple = Tuple.from([
        Integer.from(1),
        Address.from('0x0472ec0185ebb8202f3d4ddb0226998889663cf2'),
        Bytes.fromString('hello')
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

    test.todo('getEthParamType for Struct')
  })
})
