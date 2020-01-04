import Codable from './Codable'

type InnerRep = Array<{ key: string; value: Codable }>

// TODO: implement struct
export default class Struct implements Codable {
  static from(data: InnerRep): Struct {
    return new Struct(data)
  }

  constructor(public data: InnerRep, public name?: string) {}

  public get raw() {
    return this.data.map(({ key, value }) => ({
      key,
      value: value.raw
    }))
  }

  public setData(data: InnerRep) {
    this.data = data
  }

  public toString(): string {
    return `Struct({${this.data.map(d => `${d.key}:${d.value}`).join(',')}})`
  }

  public toTypeString(): string {
    return `Struct<{${this.data.map(
      d => `${d.key}:${d.value.constructor.name}`
    )}}>`
  }
}
