import Codable from './Codable'

export default class List<T extends Codable> implements Codable {
  static from<T extends Codable>(data: Array<T>): List<T> {
    return new List<T>(data)
  }

  constructor(readonly data: Array<T>) {}

  public get raw(): Array<T> {
    return this.data.map(i => i.raw)
  }

  public toString() {
    return `List<${this.data[0].toTypeString()}>([${this.data
      .map(i => i.toString())
      .join(',')}])`
  }

  public toTypeString() {
    return `List<${this.data[0].toTypeString()}>`
  }
}
