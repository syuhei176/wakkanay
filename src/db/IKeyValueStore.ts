import { Bytes } from '../types'

export interface IKeyValueStore {
  get(key: Bytes): Promise<Bytes>
  put(key: Bytes, value: Bytes): Promise<Bytes>
  del(key: Bytes): Promise<void>
  bucket(key: Bytes): IKeyValueStore
}
