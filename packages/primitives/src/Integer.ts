import Codable from './Codable'

export default class Integer implements Codable {
  static from(data: number): Integer {
    return new Integer(data)
  }

  static default(): Integer {
    return new Integer(0)
  }

  constructor(public data: number) {}

  public get raw(): number {
    return this.data
  }

  public setData(num: number) {
    this.data = num
  }

  public toString() {
    return `Integer(${this.data})`
  }

  public toTypeString(): string {
    return this.constructor.name
  }
}
