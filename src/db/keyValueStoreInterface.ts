import { Bytes } from '../types/types'

export interface KeyValueStoreInterface {
  get(key: Bytes): Promise<Bytes>
  put(key: Bytes, value: Bytes): Promise<Bytes>
  del(key: Bytes): Promise<void>
}
