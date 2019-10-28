import { ICoder } from '../../coder/ICoder'
import Codable from './Codable'

export default class List<T extends Codable> implements Codable {
  readonly v: Array<T>

  static from<T extends Codable>(data: Array<T>): List<T> {
    return new List<T>(data)
  }

  constructor(data: Array<T>) {
    this.v = data
  }

  public get raw(): Array<T> {
    return this.v.map(i => i.raw)
  }

  public encode(coder: ICoder): string {
    return coder.encodeParameter(this)
  }

  public toString() {
    return `List<${this.v[0].toTypeString()}>([${this.v
      .map(i => i.toString())
      .join(',')}])`
  }

  public toTypeString() {
    return `List<${this.v[0].toTypeString()}>`
  }
}
