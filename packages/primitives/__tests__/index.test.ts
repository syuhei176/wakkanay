import { Integer, Address, Struct, Bytes, List, Tuple } from '../src'

describe('Codables', () => {
  describe('Codable.toTypeString', () => {
    test('Struct.toTypeString', () => {
      const v = Struct.from([
        {
          key: 'amount',
          value: Integer.from(1)
        },
        {
          key: 'to',
          value: Address.from('0x0472ec0185ebb8202f3d4ddb0226998889663cf2')
        }
      ])
      expect(v.toTypeString()).toBe('Struct<{amount:Integer,to:Address}>')
    })

    test('List.toTypeString', () => {
      const v = List.from(
        {
          default: () =>
            Struct.from([
              {
                key: 'address',
                value: Address.default()
              }
            ])
        },
        [
          Struct.from([
            {
              key: 'address',
              value: Address.from('0x0472ec0185ebb8202f3d4ddb0226998889663cf2')
            }
          ]),
          Struct.from([
            {
              key: 'address',
              value: Address.from('0x0472ec0185ebb8202f3d4ddb0226998889663cf2')
            }
          ])
        ]
      )
      expect(v.toTypeString()).toBe('List<Struct<{address:Address}>>')
    })
  })

  describe('Codable.toString', () => {
    test('Integer.toString', () => {
      const v = Integer.from(1)
      expect(v.toString()).toBe('Integer(1)')
    })

    test('Bytes.toString', () => {
      const v = Bytes.from(new Uint8Array([0, 1, 2, 3]))
      expect(v.toString()).toBe('Bytes([0,1,2,3])')
    })

    test('Address.toString', () => {
      const v = Address.from('0x0472ec0185ebb8202f3d4ddb0226998889663cf2')
      expect(v.toString()).toBe(
        'Address(0x0472ec0185ebb8202f3d4ddb0226998889663cf2)'
      )
    })

    test('List.toString', () => {
      const v = List.from(Integer, [Integer.from(1), Integer.from(2)])
      expect(v.toString()).toBe('List<Integer>([Integer(1),Integer(2)])')
    })

    test('List.toString() with custom Struct', () => {
      const v = List.from(
        {
          default: () =>
            Struct.from([
              {
                key: 'address',
                value: Address.default()
              }
            ])
        },
        [
          Struct.from([
            {
              key: 'address',
              value: Address.from('0x0472ec0185ebb8202f3d4ddb0226998889663cf2')
            }
          ]),
          Struct.from([
            {
              key: 'address',
              value: Address.from('0x0472ec0185ebb8202f3d4ddb0226998889663cf2')
            }
          ])
        ]
      )
      expect(v.toString()).toBe(
        'List<Struct<{address:Address}>>([Struct({address:Address(0x0472ec0185ebb8202f3d4ddb0226998889663cf2)}),Struct({address:Address(0x0472ec0185ebb8202f3d4ddb0226998889663cf2)})])'
      )
    })

    test('Tuple.toString', () => {
      const v = Tuple.from([
        Integer.from(1),
        Address.from('0x0472ec0185ebb8202f3d4ddb0226998889663cf2')
      ])
      expect(v.toString()).toBe(
        'Tuple(Integer(1),Address(0x0472ec0185ebb8202f3d4ddb0226998889663cf2))'
      )
    })

    test('Struct.toString', () => {
      const v = Struct.from([
        {
          key: 'amount',
          value: Integer.from(1)
        },
        {
          key: 'to',
          value: Address.from('0x0472ec0185ebb8202f3d4ddb0226998889663cf2')
        }
      ])
      expect(v.toString()).toBe(
        `Struct({amount:Integer(1),to:Address(0x0472ec0185ebb8202f3d4ddb0226998889663cf2)})`
      )
    })
  })

  describe('Codable.raw()', () => {
    test('Integer.raw', () => {
      const v = Integer.from(99)
      expect(v.raw).toBe(99)
    })

    test('Bytes.raw', () => {
      const v = Bytes.from(new Uint8Array([0, 1, 2, 3]))
      expect(v.raw).toStrictEqual(new Uint8Array([0, 1, 2, 3]))
    })

    test('Address.raw', () => {
      const v = Address.from('0x0472ec0185ebb8202f3d4ddb0226998889663cf2')
      expect(v.raw).toBe('0x0472ec0185ebb8202f3d4ddb0226998889663cf2')
    })

    test('List.raw', () => {
      const v = List.from(Integer, [Integer.from(1), Integer.from(2)])
      expect(v.raw).toStrictEqual([1, 2])
    })

    test('Tuple.raw', () => {
      const v = Tuple.from([
        Integer.from(1),
        Address.from('0x0472ec0185ebb8202f3d4ddb0226998889663cf2')
      ])
      expect(v.raw).toStrictEqual([
        1,
        '0x0472ec0185ebb8202f3d4ddb0226998889663cf2'
      ])
    })

    test('Struct.raw', () => {
      const v = Struct.from([
        {
          key: 'amount',
          value: Integer.from(1)
        },
        {
          key: 'to',
          value: Address.from('0x0472ec0185ebb8202f3d4ddb0226998889663cf2')
        }
      ])
      expect(v.raw).toStrictEqual([
        1,
        '0x0472ec0185ebb8202f3d4ddb0226998889663cf2'
      ])
    })
  })
})
