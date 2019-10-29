import Codable from './Codable'

export default class Tuple implements Codable {
  static from(data: Array<Codable>): Tuple {
    return new Tuple(data)
  }

  constructor(readonly data: Array<Codable>) {}

  public get raw(): Array<Codable> {
    return this.data.map(i => i.raw)
  }

  public toString() {
    return `Tuple(${this.data.map(i => i.toString()).join(',')})`
  }

  public toTypeString() {
    return `Tuple(${this.data.map(i => i.toTypeString())})`
  }
}
