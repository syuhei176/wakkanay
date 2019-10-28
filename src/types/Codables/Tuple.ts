import { ICoder } from '../../coder/ICoder'
import Codable from './Codable'

export default class Tuple implements Codable {
  readonly v: Array<Codable>

  static from(data: Array<Codable>): Tuple {
    return new Tuple(data)
  }

  constructor(data: Array<Codable>) {
    this.v = data
  }

  public get raw(): Array<Codable> {
    return this.v.map(i => i.raw)
  }

  public encode(coder: ICoder): string {
    return coder.encodeParameter(this)
  }

  public toString() {
    return `Tuple(${this.v.map(i => i.toString()).join(',')})`
  }

  public toTypeString() {
    return `Tuple(${this.v.map(i => i.toTypeString())})`
  }
}
