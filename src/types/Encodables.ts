import { ICoder } from '../coder/ICoder'

/**
 * Encodable interface
 * All types that can be encoded to certain encoding format must implement
 * this interface.
 */
export default interface IEncodable {
  encode(coder: ICoder): string
}

export class Integer implements IEncodable {
  readonly v: number

  static from(data: number): Integer {
    return new Integer(data)
  }

  constructor(data: number) {
    this.v = data
  }

  encode(coder: ICoder): string {
    return coder.encodeInteger(this)
  }
}

export class Bytes implements IEncodable {
  readonly v: Uint8Array

  static from(data: Uint8Array): Bytes {
    return new Bytes(data)
  }

  static fromString(data: string): Bytes {
    const u = new TextEncoder().encode(data)
    return new Bytes(u)
  }

  constructor(data: Uint8Array) {
    this.v = data
  }

  toString(): string {
    return new TextDecoder().decode(this.v)
  }

  encode(coder: ICoder): string {
    return coder.encodeBytes(this)
  }
}

export class Address implements IEncodable {
  readonly v: string

  static from(data: string): Address {
    return new Address(data)
  }

  constructor(data: string) {
    this.v = data
  }

  encode(coder: ICoder): string {
    return coder.encodeAddress(this)
  }
}

export class List<T extends IEncodable> implements IEncodable {
  readonly v: Array<T>

  static from<T extends IEncodable>(data: Array<T>): List<T> {
    return new List<T>(data)
  }

  constructor(data: Array<T>) {
    this.v = data
  }

  encode(coder: ICoder): string {
    return coder.encodeList(this)
  }
}

export class Tuple implements IEncodable {
  readonly v: Array<IEncodable>

  static from(data: Array<IEncodable>): Tuple {
    return new Tuple(data)
  }

  constructor(data: Array<IEncodable>) {
    this.v = data
  }

  encode(coder: ICoder): string {
    return coder.encodeTuple(this)
  }
}
