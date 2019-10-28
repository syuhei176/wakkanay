import { ICoder } from '../../coder/ICoder'
import IEncodable from './IEncodable'

// TODO: implement struct
export default class Struct implements IEncodable {
  readonly v: { [key: string]: IEncodable }

  static from(data: { [key: string]: IEncodable }): Struct {
    return new Struct(data)
  }

  constructor(data: { [key: string]: IEncodable }) {
    this.v = data
  }

  public get raw() {
    const ret = {
      ...this.v
    }

    Object.keys(this.v).forEach(k => (ret[k] = this.v[k].raw))
    return ret
  }

  public encode(coder: ICoder): string {
    return coder.encodeParameter(this)
  }

  public toString(): string {
    return `Struct({${Object.keys(this.v)
      .sort()
      .map(k => `${k}:${this.v[k]}`)
      .join(',')}})`
  }

  public toTypeString(): string {
    return `Struct<{${Object.keys(this.v)
      .sort()
      .map(k => `${k}:${this.v[k].constructor.name}`)}}>`
  }
}
