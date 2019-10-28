import { ICoder } from '../../coder/ICoder'
import Codable from './Codable'

export default class Address implements Codable {
  readonly v: string

  static from(data: string): Address {
    return new Address(data)
  }

  static default(): Address {
    return new Address('0x0000000000000000000000000000000000000000')
  }

  constructor(data: string) {
    this.v = data
  }

  public get raw(): string {
    return this.v
  }

  public encode(coder: ICoder): string {
    return coder.encodeParameter(this)
  }

  public toString() {
    return `Address(${this.v})`
  }

  public toTypeString() {
    return 'Address'
  }
}
