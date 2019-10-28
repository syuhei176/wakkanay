import { ICoder } from '../../coder/ICoder'
import IEncodable from './IEncodable'

export default class Tuple implements IEncodable {
  readonly v: Array<IEncodable>

  static from(data: Array<IEncodable>): Tuple {
    return new Tuple(data)
  }

  constructor(data: Array<IEncodable>) {
    this.v = data
  }

  public get raw(): Array<IEncodable> {
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
