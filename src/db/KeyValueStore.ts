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
  iter(prefix: Bytes): Promise<Iterator>
  bucket(key: Bytes): KeyValueStore
}
