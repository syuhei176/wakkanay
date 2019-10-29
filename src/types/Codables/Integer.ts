import Codable from './Codable'

export default class Integer implements Codable {
  static from(data: number): Integer {
    return new Integer(data)
  }

  static default(): Integer {
    return new Integer(0)
  }

  constructor(private v: number) {}

  public get raw(): number {
    return this.v
  }

  public toString() {
    return `Integer(${this.v})`
  }

  public toTypeString(): string {
    return this.constructor.name
  }
}
