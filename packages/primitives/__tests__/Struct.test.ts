import { Address, Bytes, Integer, Struct } from '../src'

describe('Struct', () => {
  describe('equals', () => {
    const x = Struct.from([
      {
        key: 'addr',
        value: Address.from('0x0472ec0185ebb8202f3d4ddb0226998889663cf2')
      },
      {
        key: 'greet',
        value: Bytes.fromString('hello')
      },
      {
        key: 'num',
        value: Integer.from(5)
      }
    ])
    const y = Struct.from([
      {
        key: 'addr',
        value: Address.from('0x0472ec0185ebb8202f3d4ddb0226998889663cf2')
      },
      {
        key: 'greet',
        value: Bytes.fromString('hello')
      },
      {
        key: 'num',
        value: Integer.from(10)
      }
    ])

    test('succeed to equals', () => {
      expect(x.equals(x)).toBeTruthy()
    })
    test('fail to equals', () => {
      expect(x.equals(y)).toBeFalsy()
    })
  })
})
