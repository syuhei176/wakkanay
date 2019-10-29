import { ICoder } from '../../coder/Coder'
import Codable from './Codable'

export default class Tuple extends Codable {
  static from(data: Array<Codable>): Tuple {
    return new Tuple(data)
  }

  constructor(readonly data: Array<Codable>) {
    super()
  }

  public get raw(): Array<Codable> {
    return this.data.map(i => i.raw)
  }

  public encode(coder: ICoder): string {
    return coder.encodeParameter(this)
  }

  public toString() {
    return `Tuple(${this.data.map(i => i.toString()).join(',')})`
  }

  public toTypeString() {
    return `Tuple(${this.data.map(i => i.toTypeString())})`
  }
}
