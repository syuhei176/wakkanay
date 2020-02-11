import JsonCoder from '../src'
import {
  Address,
  Bytes,
  Integer,
  List,
  Tuple,
  Struct,
  BigNumber
} from '@cryptoeconomicslab/primitives'
import JSBI from 'jsbi'

describe('JsonCoder', () => {
  describe('encode', () => {
    test('encode struct', () => {
      const testData = [
        { key: 'num', value: Integer.from(5) },
        {
          key: 'addr',
          value: Address.from('0x0472ec0185ebb8202f3d4ddb0226998889663cf2')
        },
        { key: 'greet', value: Bytes.fromString('hello') }
      ]
      const struct = Struct.from(testData)

      expect(JsonCoder.encode(struct).intoString()).toBe(
        '[5,"0x0472ec0185ebb8202f3d4ddb0226998889663cf2","0x68656c6c6f"]'
      )
    })

    test('encode tuple', () => {
      const tuple = Tuple.from([
        Integer.from(5),
        Address.from('0x0472ec0185ebb8202f3d4ddb0226998889663cf2'),
        Bytes.fromString('hello')
      ])

      expect(JsonCoder.encode(tuple).intoString()).toBe(
        '[5,"0x0472ec0185ebb8202f3d4ddb0226998889663cf2","0x68656c6c6f"]'
      )
    })

    test('encode list of struct', () => {
      const factory = {
        default: () =>
          Struct.from([
            {
              key: 'num',
              value: Integer.default()
            },
            { key: 'greet', value: Bytes.default() }
          ])
      }

      const list = List.from(factory, [
        Struct.from([
          {
            key: 'num',
            value: Integer.from(1)
          },
          { key: 'greet', value: Bytes.fromString('hello') }
        ]),
        Struct.from([
          {
            key: 'num',
            value: Integer.from(2)
          },
          { key: 'greet', value: Bytes.fromString('hello') }
        ])
      ])

      expect(JsonCoder.encode(list).intoString()).toBe(
        '[[1,"0x68656c6c6f"],[2,"0x68656c6c6f"]]'
      )
    })

    test('encode empty list', () => {
      const list = List.from(Bytes, [])

      expect(JsonCoder.encode(list).intoString()).toBe('[]')
    })

    test('encode big number', () => {
      const bigNumber = BigNumber.from(
        JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(80))
      )

      expect(JsonCoder.encode(bigNumber).intoString()).toBe(
        '"1208925819614629174706176"'
      )
    })
  })

  describe('decode', () => {
    test('decode struct', () => {
      const b =
        '["0x0472ec0185ebb8202f3d4ddb0226998889663cf2","0x68656c6c6f",5]'
      const t = Struct.from([
        { key: 'addr', value: Address.default() },
        { key: 'greet', value: Bytes.default() },
        {
          key: 'num',
          value: Integer.default()
        }
      ])

      expect(JsonCoder.decode(t, Bytes.fromString(b))).toEqual(
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

    test('decode tuple', () => {
      const b =
        '["0x0472ec0185ebb8202f3d4ddb0226998889663cf2","0x68656c6c6f",5]'
      const t = Tuple.from([
        Address.default(),
        Bytes.default(),
        Integer.default()
      ])

      expect(JsonCoder.decode(t, Bytes.fromString(b))).toEqual(
        Tuple.from([
          Address.from('0x0472ec0185ebb8202f3d4ddb0226998889663cf2'),
          Bytes.fromString('hello'),
          Integer.from(5)
        ])
      )
    })

    test('decode List', () => {
      const b = '[1, 2, 3]'
      const t = List.default(Integer, Integer.default())
      expect(JsonCoder.decode(t, Bytes.fromString(b))).toStrictEqual(
        List.from(Integer, [Integer.from(1), Integer.from(2), Integer.from(3)])
      )
    })

    test('decode List of Struct', () => {
      const factory = {
        default: () =>
          Struct.from([
            {
              key: 'num',
              value: Integer.default()
            },
            { key: 'greet', value: Bytes.default() }
          ])
      }
      const b = '[[1,"0x68656c6c6f"],[2,"0x68656c6c6f"]]'
      const t = List.default(
        factory,
        Struct.from([
          {
            key: 'num',
            value: Integer.default()
          },
          { key: 'greet', value: Bytes.default() }
        ])
      )

      expect(JsonCoder.decode(t, Bytes.fromString(b))).toEqual(
        List.from(factory, [
          Struct.from([
            {
              key: 'num',
              value: Integer.from(1)
            },
            { key: 'greet', value: Bytes.fromString('hello') }
          ]),
          Struct.from([
            {
              key: 'num',
              value: Integer.from(2)
            },
            { key: 'greet', value: Bytes.fromString('hello') }
          ])
        ])
      )
    })

    test('decode big number', () => {
      expect(
        JsonCoder.decode(
          BigNumber.default(),
          Bytes.fromString('"1208925819614629174706176"')
        )
      ).toEqual(
        BigNumber.from(JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(80)))
      )
    })
  })
})
