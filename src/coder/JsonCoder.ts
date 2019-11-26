import { Coder } from './Coder'
import {
  Codable,
  Address,
  BigNumber,
  Bytes,
  Integer,
  List,
  Tuple,
  Struct
} from '../types/Codables'
import { JsonDecodeError } from './Error'

export function encodeInner(e: Codable): any {
  if (e instanceof Integer) {
    return e.data
  } else if (e instanceof BigNumber) {
    return e.data.toString(10)
  } else if (e instanceof Address) {
    return e.data
  } else if (e instanceof Bytes) {
    return e.toHexString()
  } else if (e instanceof List) {
    return e.data.map(d => encodeInner(d))
  } else if (e instanceof Tuple) {
    return e.data.map(d => encodeInner(d))
  } else if (e instanceof Struct) {
    return Object.keys(e.data)
      .sort()
      .map(k => encodeInner(e.data[k]))
  } else {
    throw JsonDecodeError.from(e)
  }
}

// decode inner representation.
// transform decoded object into certain Codable type
export function decodeInner(d: Codable, input: any): Codable {
  if (d instanceof Integer) {
    d.setData(input)
  } else if (d instanceof BigNumber) {
    d.setData(BigInt(input))
  } else if (d instanceof Address) {
    d.setData(input)
  } else if (d instanceof Bytes) {
    d.setData(Bytes.fromHexString(input).data)
  } else if (d instanceof List) {
    d.setData(
      input.map((i: any) => {
        const di = d.getC().default()
        decodeInner(di, i)
        return di
      })
    )
  } else if (d instanceof Tuple) {
    d.setData(d.data.map((d, i) => decodeInner(d, input[i])))
  } else if (d instanceof Struct) {
    const data: { [key: string]: Codable } = {}
    Object.keys(d.data)
      .sort()
      .forEach((k, i) => {
        data[k] = decodeInner(d.data[k], input[i])
      })
    d.setData(data)
  } else {
    throw JsonDecodeError.from(d)
  }
  return d
}

// JSON coder object
const JsonCoder: Coder = {
  /**
   * encode given codable object into JSON hex string representation
   * @param input codable object to encode
   */
  encode(input: Codable): Bytes {
    return Bytes.fromString(JSON.stringify(encodeInner(input)))
  },
  /**
   * decode given JSON hex string into given codable object
   * @param d Codable object to represent into what type data is decoded
   * @param data hex string to decode
   */
  decode<T extends Codable>(d: T, data: Bytes): T {
    return decodeInner(d, JSON.parse(data.intoString())) as T
  }
}

export default JsonCoder
