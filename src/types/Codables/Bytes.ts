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
    const match = hex.match(/^(0x)?([0-9a-fA-F]*)$/)
    if (match) {
      const value = match[2]
      const result = []
      for (let i = 0; i < value.length; i += 2) {
        result.push(parseInt(value.substr(i, 2), 16))
      }
      return new Bytes(Uint8Array.from(result))
    } else {
      throw new Error('invalid hex string')
    }
  }

  static fromBuffer(data: Buffer): Bytes {
    return new Bytes(Uint8Array.from(data))
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

  public padZero(length: number): Bytes {
    const buffer = new ArrayBuffer(length)
    const newData = new Uint8Array(buffer)
    newData.set(this.data, length - this.data.length)
    this.data = newData
    return this
  }

  public equals(target: Bytes): boolean {
    return Buffer.compare(Buffer.from(this.data), Buffer.from(target.data)) == 0
  }

  public static concat(a: Bytes | Bytes[], b?: Bytes) {
    if (a instanceof Bytes && !!b) {
      const result = new Uint8Array(a.data.length + b.data.length)
      result.set(a.data)
      result.set(b.data, a.data.length)
      return Bytes.from(result)
    } else {
      return Bytes.from(
        Uint8Array.from(
          Buffer.concat((a as Bytes[]).map(a => Buffer.from(a.data)))
        )
      )
    }
  }

  public increment(): Bytes {
    const arr = this.raw.slice()
    for (let i = arr.length - 1; i >= 0; i--) {
      arr[i] += 1
      if (arr[i] !== 0) {
        return Bytes.from(arr)
      }
    }

    throw new Error('cannot incremented.')
  }
}
