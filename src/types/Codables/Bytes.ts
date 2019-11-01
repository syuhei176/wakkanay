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
}
