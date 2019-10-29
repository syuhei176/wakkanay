import { ICoder } from '../../coder/Coder'
import Codable from './Codable'

export default class Bytes extends Codable {
  static from(data: Uint8Array): Bytes {
    return new Bytes(data)
  }

  static default(): Bytes {
    return new Bytes(new Uint8Array())
  }

  static fromString(data: string): Bytes {
    const u = new TextEncoder().encode(data)
    return new Bytes(u)
  }

  constructor(readonly data: Uint8Array) {
    super()
  }

  public get raw(): Uint8Array {
    return this.data
  }

  public intoString(): string {
    return new TextDecoder().decode(this.data)
  }

  public encode(coder: ICoder): string {
    return coder.encodeParameter(this)
  }

  public toString() {
    return `Bytes([${this.data}])`
  }

  public toTypeString() {
    return 'Bytes'
  }
}
