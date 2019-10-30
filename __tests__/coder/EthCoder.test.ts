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
    test('getEthParamType for Tuple', () => {})

    test.todo('getEthParamType for Struct', () => {})
  })
})
