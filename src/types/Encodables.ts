import { ICoder } from '../coder/ICoder'

/**
 * Encodable interface
 * All types that can be encoded to certain encoding format must implement
 * this interface.
 */
export default interface IEncodable {
  encode(coder: ICoder): string
  raw: any
}

export class Integer implements IEncodable {
  private v: number

  static from(data: number): Integer {
    return new Integer(data)
  }

  constructor(data: number) {
    this.v = data
  }

  public get raw(): number {
    return this.v
  }

  public encode(coder: ICoder): string {
    return coder.encodeParameter(this)
  }

  public toString() {
    return `Integer(${this.v})`
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

  public get raw(): Uint8Array {
    return this.v
  }

  public intoString(): string {
    return new TextDecoder().decode(this.v)
  }

  public encode(coder: ICoder): string {
    return coder.encodeParameter(this)
  }

  public toString() {
    return `Bytes(${this.v})`
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

  public get raw(): string {
    return this.v
  }

  public encode(coder: ICoder): string {
    return coder.encodeParameter(this)
  }

  public toString() {
    return `Address(${this.v})`
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

  public get raw(): Array<T> {
    return this.v
  }

  public encode(coder: ICoder): string {
    return coder.encodeParameter(this)
  }

  public toString() {
    return `List([${this.v.map(i => i.toString()).join(',')}])`
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

  public get raw(): Array<IEncodable> {
    return this.v
  }

  public encode(coder: ICoder): string {
    return coder.encodeParameter(this)
  }

  public toString() {
    return `Tuple(${this.v.map(i => i.toString()).join(',')})`
  }
}

// TODO: implement struct
