import { ICoder } from '../../coder/ICoder'
import Codable from './Codable'

// TODO: implement struct
export default class Struct implements Codable {
  readonly v: { [key: string]: Codable }

  static from(data: { [key: string]: Codable }): Struct {
    return new Struct(data)
  }

  constructor(data: { [key: string]: Codable }) {
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
