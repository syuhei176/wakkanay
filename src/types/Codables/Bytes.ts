import Codable from './Codable'
import util from 'util'

export default class Bytes implements Codable {
  static from(data: Uint8Array): Bytes {
    return new Bytes(data)
  }

  static default(): Bytes {
    return new Bytes(new Uint8Array())
  }

  static fromString(data: string): Bytes {
    const u = new util.TextEncoder().encode(data)
    return new Bytes(u)
  }

  static fromHexString(hex: string): Bytes {
    var match = hex.match(/^(0x)?[0-9a-fA-F]*$/)
    if (match) {
      const array = match[1].split('').map(h => {
        return parseInt(h, 16)
      })
      return new Bytes(Uint8Array.from(array))
    } else {
      throw new Error('invalid hex string')
    }
  }

  constructor(public data: Uint8Array) {}

  public get raw(): Uint8Array {
    return this.data
  }

  public setData(data: Uint8Array) {
    this.data = data
  }

  public intoString(): string {
    return new util.TextDecoder().decode(this.data)
  }

  public toString() {
    return `Bytes([${this.data}])`
  }

  public toTypeString() {
    return 'Bytes'
  }

  public toHexString() {
    return this.data.reduce(
      (str, byte) => str + byte.toString(16).padStart(2, '0'),
      '0x'
    )
  }

  public static concat(a: Bytes, b: Bytes) {
    let result = new Uint8Array(a.data.length + b.data.length)
    result.set(a.data)
    result.set(b.data, a.data.length)
    return Bytes.from(result)
  }
}
