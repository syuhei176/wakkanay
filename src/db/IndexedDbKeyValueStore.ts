import { KeyValueStore, Iterator, BatchOperation } from './KeyValueStore'
import { Bytes } from '../types/Codables'

export class IndexedDbKeyValueStore implements KeyValueStore {
  async get(key: Bytes): Promise<Bytes | null> {
    return null
  }

  async put(key: Bytes, value: Bytes): Promise<void> {
    console.log('put')
  }
  async del(key: Bytes): Promise<void> {
    console.log('del')
  }
  async batch(operations: BatchOperation[]): Promise<void> {
    console.log('batch')
  }
  iter(lowerBound: Bytes): Iterator {
    return { next: () => Promise.resolve(null) }
  }
  bucket(key: Bytes): KeyValueStore {
    return this
  }
}
