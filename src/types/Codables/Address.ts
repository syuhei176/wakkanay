import Codable from './Codable'

export default class Address implements Codable {
  static from(data: string): Address {
    return new Address(data)
  }

  static default(): Address {
    return new Address('0x0000000000000000000000000000000000000000')
  }

  constructor(readonly data: string) {}

  public get raw(): string {
    return this.data
  }

  public toTypeString(): string {
    return this.constructor.name
  }

  public toString() {
    return `Address(${this.data})`
  }
}
