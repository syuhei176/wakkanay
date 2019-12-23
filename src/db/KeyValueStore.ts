import { Bytes } from '../types/Codables'

export interface PutBatchOperation {
  type: 'Put'
  key: Bytes
  value: Bytes
}

export interface DelBatchOperation {
  type: 'Del'
  key: Bytes
}

export type BatchOperation = PutBatchOperation | DelBatchOperation

export interface Iterator {
  next(): Promise<{ key: Bytes; value: Bytes } | null>
}

export interface KeyValueStore {
  get(key: Bytes): Promise<Bytes | null>
  put(key: Bytes, value: Bytes): Promise<void>
  del(key: Bytes): Promise<void>
  batch(operations: BatchOperation[]): Promise<void>
  /**
   * `iter` returns `Iterator` which is for seeking values sorted by their keys.
   * @param bound We can get `Iterator` which seek values greater than `lowerBound` in dictionary order.
   */
  iter(lowerBound: Bytes, lowerBoundExclusive?: boolean): Iterator
  bucket(key: Bytes): Promise<KeyValueStore>
  close(): Promise<void>
  open(): Promise<void>
}
