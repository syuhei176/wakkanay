import { Address, BigNumber, Bytes, Tuple } from '../src'

describe('Tuple', () => {
  describe('equals', () => {
    const x = Tuple.from([
      BigNumber.from(5),
      Address.from('0x0472ec0185ebb8202f3d4ddb0226998889663cf2'),
      Bytes.fromString('hello')
    ])
    const y = Tuple.from([
      BigNumber.from(10),
      Address.from('0x0472ec0185ebb8202f3d4ddb0226998889663cf2'),
      Bytes.fromString('hello')
    ])

    test('succeed to equals', () => {
      expect(x.equals(x)).toBeTruthy()
    })
    test('fail to equals', () => {
      expect(x.equals(y)).toBeFalsy()
    })
  })
})
