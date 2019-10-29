import { ICoder } from '../../coder/Coder'
import Codable from './Codable'

// TODO: implement struct
export default class Struct extends Codable {
  static from(data: { [key: string]: Codable }): Struct {
    return new Struct(data)
  }

  constructor(readonly data: { [key: string]: Codable }) {
    super()
  }

  public get raw() {
    const ret = {
      ...this.data
    }

    Object.keys(this.data).forEach(k => (ret[k] = this.data[k].raw))
    return ret
  }

  public encode(coder: ICoder): string {
    return coder.encodeParameter(this)
  }

  public toString(): string {
    return `Struct({${Object.keys(this.data)
      .sort()
      .map(k => `${k}:${this.data[k]}`)
      .join(',')}})`
  }

  public toTypeString(): string {
    return `Struct<{${Object.keys(this.data)
      .sort()
      .map(k => `${k}:${this.data[k].constructor.name}`)}}>`
  }
}
