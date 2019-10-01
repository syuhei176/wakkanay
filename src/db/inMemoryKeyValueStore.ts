import { IKeyValueStore } from './IKeyValueStore'
import { Bytes } from '../types'

export class InMemoryKeyValueStore implements IKeyValueStore {
  public get(key: Bytes): Promise<Bytes> {
    return Promise.resolve('example value')
  }

  public put(key: Bytes, value: Bytes): Promise<Bytes> {
    return Promise.resolve(value)
  }

  public del(key: Bytes): Promise<void> {
    return Promise.resolve()
  }

  public bucket(key: Bytes): IKeyValueStore {
    return this
  }
}
