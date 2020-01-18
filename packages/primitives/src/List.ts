import Codable, { CodableF } from './Codable'

export default class List<T extends Codable> implements Codable {
  static from<T extends Codable>(C: CodableF<T>, data: Array<T>): List<T> {
    return new List<T>(C, data)
  }

  constructor(public C: CodableF<T>, public data: Array<T>) {}

  public static default<T extends Codable>(C: CodableF<T>, d: T): List<T> {
    return new List<T>(C, [d])
  }

  public getC(): CodableF<T> {
    return this.C
  }

  public get raw(): Array<T> {
    return this.data.map(i => i.raw)
  }

  public setData(data: Array<T>) {
    this.data = data
  }

  public toString() {
    return `List<${this.data[0].toTypeString()}>([${this.data
      .map(i => i.toString())
      .join(',')}])`
  }

  public toTypeString() {
    return `List<${this.data[0].toTypeString()}>`
  }
}
