import Codable from './Codable'

// TODO: implement struct
export default class Struct implements Codable {
  static from(data: { [key: string]: Codable }): Struct {
    return new Struct(data)
  }

  constructor(public data: { [key: string]: Codable }, public name?: string) {}

  public get raw() {
    const ret = {
      ...this.data
    }

    Object.keys(this.data).forEach(k => (ret[k] = this.data[k].raw))
    return ret
  }

  public setData(data: { [key: string]: Codable }) {
    this.data = data
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
