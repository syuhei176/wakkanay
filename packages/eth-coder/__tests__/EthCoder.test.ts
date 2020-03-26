import EthCoder, { getEthParamType } from '../src'
import {
  Address,
  Bytes,
  Integer,
  List,
  Tuple,
  Struct,
  BigNumber,
  FixedBytes
} from '@cryptoeconomicslab/primitives'
import JSBI from 'jsbi'

describe('EthCoder', () => {
  describe('encode', () => {
    test('encode bignumber', () => {
      const bigNumber = BigNumber.from(10)
      expect(EthCoder.encode(bigNumber)).toEqual(
        EthCoder.encode(Integer.from(10))
      )
    })

    test('encode FixedBytes', () => {
      const fixedBytes = FixedBytes.fromHexString(
        32,
        '0xef583c07cae62e3a002a9ad558064ae80db17162801132f9327e8bb6da16ea8a'
      )
      expect(EthCoder.encode(fixedBytes).toHexString()).toEqual(
        '0xef583c07cae62e3a002a9ad558064ae80db17162801132f9327e8bb6da16ea8a'
      )
    })

    test('encode struct', () => {
      const struct = Struct.from([
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

      expect(EthCoder.encode(struct).toHexString()).toBe(
        '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000472ec0185ebb8202f3d4ddb0226998889663cf200000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000000568656c6c6f000000000000000000000000000000000000000000000000000000'
      )
    })

    test('encode struct with FixedBytes', () => {
      const struct = Struct.from([
        {
          key: 'data',
          value: FixedBytes.fromHexString(
            32,
            '0xef583c07cae62e3a002a9ad558064ae80db17162801132f9327e8bb6da16ea8a'
          )
        },
        {
          key: 'start',
          value: BigNumber.from(5000)
        }
      ])
      expect(EthCoder.encode(struct).toHexString()).toBe(
        '0xef583c07cae62e3a002a9ad558064ae80db17162801132f9327e8bb6da16ea8a0000000000000000000000000000000000000000000000000000000000001388'
      )
    })

    test('encode tuple', () => {
      const tuple = Tuple.from([
        BigNumber.from(5),
        Address.from('0x0472ec0185ebb8202f3d4ddb0226998889663cf2'),
        Bytes.fromString('hello')
      ])

      expect(EthCoder.encode(tuple).toHexString()).toBe(
        '0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000050000000000000000000000000472ec0185ebb8202f3d4ddb0226998889663cf20000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000568656c6c6f000000000000000000000000000000000000000000000000000000'
      )
    })

    test('encode list of struct', () => {
      const factory = {
        default: () =>
          Struct.from([
            {
              key: 'greet',
              value: Bytes.default()
            },
            {
              key: 'num',
              value: Integer.default()
            }
          ])
      }

      const list = List.from(factory, [
        Struct.from([
          {
            key: 'greet',
            value: Bytes.fromString('hello')
          },
          {
            key: 'num',
            value: Integer.from(1)
          }
        ]),
        Struct.from([
          {
            key: 'greet',
            value: Bytes.fromString('hello')
          },
          {
            key: 'num',
            value: Integer.from(2)
          }
        ])
      ])

      expect(EthCoder.encode(list).toHexString()).toBe(
        '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000568656c6c6f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000568656c6c6f000000000000000000000000000000000000000000000000000000'
      )
    })

    test('encode empty list', () => {
      const list = List.from(Bytes, [])

      expect(EthCoder.encode(list).toHexString()).toBe(
        '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000'
      )
    })

    test('encode, decode list of list of integer', () => {
      const list = List.from(
        { default: () => List.default(Integer, Integer.default()) },
        [
          List.from(Integer, [Integer.from(4), Integer.from(6)]),
          List.from(Integer, [Integer.from(2), Integer.from(0)]),
          List.from(Integer, [Integer.from(7), Integer.from(23)]),
          List.from(Integer, [Integer.from(5), Integer.from(8)])
        ]
      )

      const encoded = EthCoder.encode(list)
      const decoded = EthCoder.decode(
        List.default(
          {
            default: () => List.default(Integer, Integer.default())
          },
          List.from(Integer, [])
        ),
        encoded
      )

      expect(decoded.data).toEqual(list.data)
    })
  })

  describe('decode', () => {
    test('bignum', () => {
      const bn = BigNumber.default()
      bn.setData(JSBI.BigInt(10))
      expect(bn).toEqual(BigNumber.from(10))
    })

    test('decode bignumber', () => {
      const b =
        '0x000000000000000000000000000000000000000000000000000000000000000a'
      expect(
        EthCoder.decode(BigNumber.default(), Bytes.fromHexString(b))
      ).toEqual(BigNumber.from(10))
    })

    test('decode FixedBytes', () => {
      const b =
        '0xef583c07cae62e3a002a9ad558064ae80db17162801132f9327e8bb6da16ea8a'
      expect(
        EthCoder.decode(FixedBytes.default(32), Bytes.fromHexString(b))
      ).toEqual(
        FixedBytes.fromHexString(
          32,
          '0xef583c07cae62e3a002a9ad558064ae80db17162801132f9327e8bb6da16ea8a'
        )
      )
    })

    test('decode struct', () => {
      const b =
        '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000472ec0185ebb8202f3d4ddb0226998889663cf200000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000000568656c6c6f000000000000000000000000000000000000000000000000000000'
      const t = Struct.from([
        {
          key: 'addr',
          value: Address.default()
        },
        {
          key: 'greet',
          value: Bytes.default()
        },
        {
          key: 'num',
          value: Integer.default()
        }
      ])

      expect(EthCoder.decode(t, Bytes.fromHexString(b))).toEqual(
        Struct.from([
          {
            key: 'addr',
            value: Address.from('0x0472ec0185ebb8202f3d4ddb0226998889663cf2')
          },
          {
            key: 'greet',
            value: Bytes.from(new Uint8Array([104, 101, 108, 108, 111]))
          },
          {
            key: 'num',
            value: Integer.from(5)
          }
        ])
      )
    })

    test('decode struct with FixedBytes', () => {
      const b =
        '0xef583c07cae62e3a002a9ad558064ae80db17162801132f9327e8bb6da16ea8a0000000000000000000000000000000000000000000000000000000000001388'
      const t = Struct.from([
        {
          key: 'data',
          value: FixedBytes.default(32)
        },
        {
          key: 'start',
          value: BigNumber.default()
        }
      ])
      expect(EthCoder.decode(t, Bytes.fromHexString(b))).toEqual(
        Struct.from([
          {
            key: 'data',
            value: FixedBytes.fromHexString(
              32,
              '0xef583c07cae62e3a002a9ad558064ae80db17162801132f9327e8bb6da16ea8a'
            )
          },
          {
            key: 'start',
            value: BigNumber.from(5000)
          }
        ])
      )
    })

    test('decode tuple', () => {
      const b =
        '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000472ec0185ebb8202f3d4ddb0226998889663cf200000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000005000000000000000000000000000000000000000000000000000000000000000568656c6c6f000000000000000000000000000000000000000000000000000000'
      const t = Tuple.from([
        Address.default(),
        Bytes.default(),
        Integer.default()
      ])

      expect(EthCoder.decode(t, Bytes.fromHexString(b))).toEqual(
        Tuple.from([
          Address.from('0x0472ec0185ebb8202f3d4ddb0226998889663cf2'),
          Bytes.fromString('hello'),
          Integer.from(5)
        ])
      )
    })

    test('decode List', () => {
      const b =
        '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000003'
      const t = List.default(Integer, Integer.default())
      expect(EthCoder.decode(t, Bytes.fromHexString(b))).toEqual(
        List.from(Integer, [Integer.from(1), Integer.from(2), Integer.from(3)])
      )
    })

    test('decode List of Struct', () => {
      const factory = {
        default: () =>
          Struct.from([
            {
              key: 'greet',
              value: Bytes.default()
            },
            {
              key: 'num',
              value: Integer.default()
            }
          ])
      }
      const b =
        '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000568656c6c6f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000568656c6c6f000000000000000000000000000000000000000000000000000000'
      const t = List.default(
        factory,
        Struct.from([
          {
            key: 'greet',
            value: Bytes.default()
          },
          {
            key: 'num',
            value: Integer.default()
          }
        ])
      )

      expect(EthCoder.decode(t, Bytes.fromHexString(b))).toEqual(
        List.from(factory, [
          Struct.from([
            {
              key: 'greet',
              value: Bytes.fromString('hello')
            },
            {
              key: 'num',
              value: Integer.from(1)
            }
          ]),
          Struct.from([
            {
              key: 'greet',
              value: Bytes.fromString('hello')
            },
            {
              key: 'num',
              value: Integer.from(2)
            }
          ])
        ])
      )
    })
  })

  describe('getEthParamType()', () => {
    test('getEthParamType for FixedBytes', () => {
      const fixedBytes = FixedBytes.fromHexString(
        32,
        '0xef583c07cae62e3a002a9ad558064ae80db17162801132f9327e8bb6da16ea8a'
      )
      expect(getEthParamType(fixedBytes).type).toBe('bytes32')
    })

    test('getEthParamType for Tuple', () => {
      const tuple = Tuple.from([
        Integer.default(),
        Address.default(),
        Bytes.default()
      ])

      expect(getEthParamType(tuple)).toEqual({
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

      expect(getEthParamType(tuple)).toEqual({
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
      const struct = Struct.from([
        {
          key: 'addr',
          value: Address.default()
        },
        {
          key: 'greet',
          value: Bytes.default()
        },
        {
          key: 'num',
          value: Integer.default()
        }
      ])

      expect(getEthParamType(struct)).toEqual({
        type: 'tuple',
        components: [
          { type: 'address', name: 'addr' },
          { type: 'bytes', name: 'greet' },
          { type: 'uint256', name: 'num' }
        ]
      })
    })

    test('getEthParamType for nested Struct', () => {
      const struct = Struct.from([
        {
          key: 'addr',
          value: Address.default()
        },
        {
          key: 'from',
          value: Struct.from([
            {
              key: 'addr',
              value: Address.default()
            }
          ])
        },
        {
          key: 'greet',
          value: Bytes.default()
        },
        {
          key: 'num',
          value: Integer.default()
        }
      ])

      expect(getEthParamType(struct)).toEqual({
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

    test('paramType for list of struct', () => {
      const list = List.from(
        {
          default: () =>
            new Struct([
              {
                key: 'amount',
                value: Integer.default()
              },
              {
                key: 'from',
                value: Address.default()
              }
            ])
        },
        []
      )

      expect(getEthParamType(list)).toEqual({
        type: 'tuple[]',
        components: [
          { type: 'uint256', name: 'amount' },
          { type: 'address', name: 'from' }
        ]
      })
    })

    test('paramType for list of list of struct', () => {
      const list = List.from(
        {
          default: () =>
            List.default(
              {
                default: () =>
                  new Struct([
                    {
                      key: 'amount',
                      value: Integer.default()
                    },
                    {
                      key: 'from',
                      value: Address.default()
                    }
                  ])
              },
              new Struct([
                {
                  key: 'amount',
                  value: Integer.default()
                },
                {
                  key: 'from',
                  value: Address.default()
                }
              ])
            )
        },
        []
      )

      expect(getEthParamType(list)).toEqual({
        type: 'tuple[][]',
        components: [
          { type: 'uint256', name: 'amount' },
          { type: 'address', name: 'from' }
        ]
      })
    })
  })
})
