import Codable from './Codable'

// Interface for Codable Class
interface CodableF<T extends Codable> {
  new (arg: any): T
}

export default class List<T extends Codable> implements Codable {
  static from<T extends Codable>(C: CodableF<T>, data: Array<T>): List<T> {
    return new List<T>(C, data)
  }

  constructor(public C: CodableF<T>, public data: Array<T>) {}

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
