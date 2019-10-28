import { ICoder } from '../../coder/ICoder'
import IEncodable from './IEncodable'

export default class Integer implements IEncodable {
  private v: number

  static from(data: number): Integer {
    return new Integer(data)
  }

  static default(): Integer {
    return new Integer(0)
  }

  constructor(data: number) {
    this.v = data
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
