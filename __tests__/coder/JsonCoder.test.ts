import JsonCoder from '../../src/coder/JsonCoder'
import {
  Address,
  Bytes,
  Integer,
  List,
  Tuple,
  Struct,
  BigNumber
} from '../../src/types/Codables'

describe('JsonCoder', () => {
  describe('encode', () => {
    test('encode struct', () => {
      const testData = {
        num: Integer.from(5),
        addr: Address.from('0x0472ec0185ebb8202f3d4ddb0226998889663cf2'),
        greet: Bytes.fromString('hello')
      }
      const struct = Struct.from(testData)

      expect(JsonCoder.encode(struct).intoString()).toBe(
        '["0x0472ec0185ebb8202f3d4ddb0226998889663cf2","0x68656c6c6f",5]'
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
          Struct.from({
            num: Integer.default(),
            greet: Bytes.default()
          })
      }

      const list = List.from(factory, [
        Struct.from({
          num: Integer.from(1),
          greet: Bytes.fromString('hello')
        }),
        Struct.from({
          num: Integer.from(2),
          greet: Bytes.fromString('hello')
        })
      ])

      expect(JsonCoder.encode(list).intoString()).toBe(
        '[["0x68656c6c6f",1],["0x68656c6c6f",2]]'
      )
    })

    test('encode empty list', () => {
      const list = List.from(Bytes, [])

      expect(JsonCoder.encode(list).intoString()).toBe('[]')
    })

    test('encode big number', () => {
      const bigNumber = BigNumber.from(2n ** 80n)

      expect(JsonCoder.encode(bigNumber).intoString()).toBe(
        '"1208925819614629174706176"'
      )
    })
  })

  describe('decode', () => {
    test('decode struct', () => {
      const b =
        '["0x0472ec0185ebb8202f3d4ddb0226998889663cf2","0x68656c6c6f",5]'
      const t = Struct.from({
        addr: Address.default(),
        greet: Bytes.default(),
        num: Integer.default()
      })

      expect(JsonCoder.decode(t, Bytes.fromString(b))).toStrictEqual(
        Struct.from({
          num: Integer.from(5),
          addr: Address.from('0x0472ec0185ebb8202f3d4ddb0226998889663cf2'),
          greet: Bytes.from(new Uint8Array([104, 101, 108, 108, 111]))
        })
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

      expect(JsonCoder.decode(t, Bytes.fromString(b))).toStrictEqual(
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
          Struct.from({
            num: Integer.default(),
            greet: Bytes.default()
          })
      }
      const b = '[["0x68656c6c6f",1],["0x68656c6c6f",2]]'
      const t = List.default(
        factory,
        Struct.from({
          num: Integer.default(),
          greet: Bytes.default()
        })
      )

      expect(JsonCoder.decode(t, Bytes.fromString(b))).toStrictEqual(
        List.from(factory, [
          Struct.from({
            num: Integer.from(1),
            greet: Bytes.fromString('hello')
          }),
          Struct.from({
            num: Integer.from(2),
            greet: Bytes.fromString('hello')
          })
        ])
      )
    })

    test('decode big number', () => {
      expect(
        JsonCoder.decode(
          BigNumber.default(),
          Bytes.fromString('"1208925819614629174706176"')
        )
      ).toStrictEqual(BigNumber.from(2n ** 80n))
    })
  })
})
