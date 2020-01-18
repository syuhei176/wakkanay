import Codable from './Codable'

export default class BigNumber implements Codable {
  static MAX_NUMBER: BigNumber = new BigNumber(
    BigInt(2) ** BigInt(256) - BigInt(1)
  )

  static fromString(str: string): BigNumber {
    return new BigNumber(BigInt(str))
  }

  static fromHexString(hex: string): BigNumber {
    const match = hex.match(/^(0x)?([0-9a-fA-F]*)$/)
    if (hex == '0x') hex = '0x00'
    if (match) {
      return new BigNumber(BigInt(hex))
    } else {
      throw new Error('invalid hex string')
    }
  }

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
    return new BigNumber(BigInt(0))
  }

  constructor(public data: bigint) {}

  public get raw() {
    return this.data.toString()
  }

  public setData(num: bigint) {
    this.data = num
  }

  public toString() {
    return `BigNumber(${this.data})`
  }

  public toHexString(prefixRequired = true) {
    const hex = this.data.toString(16)
    return (prefixRequired ? '0x' : '') + (hex.length % 2 == 1 ? '0' : '') + hex
  }

  public toTypeString(): string {
    return this.constructor.name
  }
}
