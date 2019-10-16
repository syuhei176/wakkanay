import { Bytes, Option } from '../types'

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
  next(): Promise<Option<{ key: Bytes; value: Bytes }>
}

export interface KeyValueStore {
  get(key: Bytes): Promise<Option<Bytes>>
  put(key: Bytes, value: Bytes): Promise<void>
  del(key: Bytes): Promise<void>
  batch(operations: BatchOperation[]): Promise<void>
  iter(prefix: Bytes): Promise<Iterator>
  bucket(key: Bytes): KeyValueStore
}
