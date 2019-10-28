import { ICoder } from '../../coder/ICoder'
import IEncodable from './IEncodable'

export default class Bytes implements IEncodable {
  readonly v: Uint8Array

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

  constructor(data: Uint8Array) {
    this.v = data
  }

  public get raw(): Uint8Array {
    return this.v
  }

  public intoString(): string {
    return new TextDecoder().decode(this.v)
  }

  public encode(coder: ICoder): string {
    return coder.encodeParameter(this)
  }

  public toString() {
    return `Bytes([${this.v}])`
  }
}
