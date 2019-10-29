import { ICoder } from '../../coder/Coder'
import Codable from './Codable'

export default class List<T extends Codable> extends Codable {
  static from<T extends Codable>(data: Array<T>): List<T> {
    return new List<T>(data)
  }

  constructor(readonly data: Array<T>) {
    super()
  }

  public get raw(): Array<T> {
    return this.data.map(i => i.raw)
  }

  public encode(coder: ICoder): string {
    return coder.encodeParameter(this)
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
