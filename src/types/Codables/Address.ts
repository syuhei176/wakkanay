import Codable from './Codable'

export default class Address implements Codable {
  public data: string

  static from(data: string): Address {
    return new Address(data)
  }

  static default(): Address {
    return new Address('0x0000000000000000000000000000000000000000')
  }

  constructor(data: string) {
    this.data = data.toLowerCase()
  }

  public get raw(): string {
    return this.data
  }

  public setData(data: string) {
    this.data = data.toLowerCase()
  }

  public toTypeString(): string {
    return this.constructor.name
  }

  public toString() {
    return `Address(${this.data})`
  }
}
