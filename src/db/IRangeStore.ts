import { Bytes } from '../types'

export interface IRangeStore {
  get(start: number, end: number): Promise<Bytes>
  put(start: number, end: number, value: Bytes): Promise<Bytes>
  del(start: number, end: number): Promise<void>
  bucket(key: Bytes): IRangeStore
}
