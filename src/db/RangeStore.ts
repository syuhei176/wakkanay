import { Bytes } from '../types'

export class RangeRecord {
  public static decode(bytes: Bytes): RangeRecord {
    const obj = JSON.parse(bytes)
    return new RangeRecord(obj.start, obj.end, obj.value)
  }
  public start: number
  public end: number
  public value: Bytes
  constructor(start: number, end: number, value: Bytes) {
    this.start = start
    this.end = end
    this.value = value
  }
  public encode(): Bytes {
    return JSON.stringify(this)
  }
  public intersect(start: number, end: number): boolean {
    const maxStart = Math.max(this.start, start)
    const maxEnd = Math.min(this.end, end)
    return maxStart < maxEnd
  }
}

export interface RangeStore {
  get(start: number, end: number): Promise<RangeRecord[]>
  put(start: number, end: number, value: Bytes): Promise<void>
  del(start: number, end: number): Promise<void>
  bucket(key: Bytes): RangeStore
}
