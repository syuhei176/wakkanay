import { ICoder } from '../../coder/ICoder'
import IEncodable from './IEncodable'

export default class List<T extends IEncodable> implements IEncodable {
  readonly v: Array<T>

  static from<T extends IEncodable>(data: Array<T>): List<T> {
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
