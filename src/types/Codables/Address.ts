import { ICoder } from '../../coder/Coder'
import Codable from './Codable'

export default class Address extends Codable {
  static from(data: string): Address {
    return new Address(data)
  }

  static default(): Address {
    return new Address('0x0000000000000000000000000000000000000000')
  }

  constructor(readonly data: string) {
    super()
  }

  public get raw(): string {
    return this.data
  }

  public encode(coder: ICoder): string {
    return coder.encodeParameter(this)
  }

  public toString() {
    return `Address(${this.data})`
  }
}
