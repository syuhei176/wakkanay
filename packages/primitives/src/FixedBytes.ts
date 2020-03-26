import Codable from './Codable'

export default class FixedBytes implements Codable {
  static from(size: number, data: Uint8Array): FixedBytes {
    return new FixedBytes(size, data)
  }

  static default(size: number): FixedBytes {
    return new FixedBytes(size, new Uint8Array(Array(size).map(() => 0)))
  }

  static fromHexString(size: number, hex: string): FixedBytes {
    const match = hex.match(/^(0x)?([0-9a-fA-F]*)$/)
    if (match) {
      let value = match[2]
      if (value.length % 2 == 1) {
        value = '0' + value
      }
      const result: number[] = []
      for (let i = 0; i < value.length; i += 2) {
        result.push(parseInt(value.substr(i, 2), 16))
      }
      return new FixedBytes(size, Uint8Array.from(result))
    } else {
      throw new Error('invalid hex string')
    }
  }

  static fromBuffer(size: number, data: Buffer): FixedBytes {
    return new FixedBytes(size, Uint8Array.from(data))
  }

  constructor(public size: number, public data: Uint8Array) {
    if (size !== data.length) {
      throw new Error(
        `data size does not match. expect ${size}, received ${data.length}`
      )
    }
  }

  public get raw(): Uint8Array {
    return this.data
  }

  public setData(data: Uint8Array) {
    if (data.length !== this.size) {
      throw new Error(
        `data size does not match. expect ${this.size}, received ${data.length}`
      )
    }
    this.data = data
  }

  public toString() {
    return `FixedBytes${this.size}([${this.data}])`
  }

  public toTypeString() {
    return `FixedBytes${this.size}`
  }

  public toHexString() {
    return this.data.reduce(
      (str, byte) => str + byte.toString(16).padStart(2, '0'),
      '0x'
    )
  }

  public equals(target: FixedBytes): boolean {
    return Buffer.compare(Buffer.from(this.data), Buffer.from(target.data)) == 0
  }
}
