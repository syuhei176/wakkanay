import Codable from './Codable'

export default class Tuple implements Codable {
  static from(data: Array<Codable>): Tuple {
    return new Tuple(data)
  }

  constructor(public data: Array<Codable>) {}

  public get raw(): Array<Codable> {
    return this.data.map(i => i.raw)
  }

  public setData(data: Array<Codable>) {
    this.data = data
  }

  public toString() {
    return `Tuple(${this.data.map(i => i.toString()).join(',')})`
  }

  public toTypeString() {
    return `Tuple(${this.data.map(i => i.toTypeString())})`
  }

  public equals(tuple: Tuple): boolean {
    return JSON.stringify(this.data) === JSON.stringify(tuple.data)
  }
}
