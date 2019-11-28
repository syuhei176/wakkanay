import Codable from './Codable'

export default class BigNumber implements Codable {
  static MAX_NUMBER: BigNumber = new BigNumber(2n ** 256n - 1n)

  static from(data: number | bigint | BigNumber): BigNumber {
    if (typeof data == 'number') {
      return new BigNumber(BigInt(data))
    } else if (typeof data == 'bigint') {
      return new BigNumber(data)
    } else {
      return data
    }
  }

  static default(): BigNumber {
    return new BigNumber(0n)
  }

  constructor(public data: bigint) {}

  public get raw(): bigint {
    return this.data
  }

  public setData(num: bigint) {
    this.data = num
  }

  public toString() {
    return `BigNumber(${this.data})`
  }

  public toTypeString(): string {
    return this.constructor.name
  }
}
