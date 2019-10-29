import { ICoder } from '../../coder/Coder'
import Codable from './Codable'

export default class Integer extends Codable {
  static from(data: number): Integer {
    return new Integer(data)
  }

  static default(): Integer {
    return new Integer(0)
  }

  constructor(private v: number) {
    super()
  }

  public get raw(): number {
    return this.v
  }

  public encode(coder: ICoder): string {
    return coder.encodeParameter(this)
  }

  public toString() {
    return `Integer(${this.v})`
  }
}
