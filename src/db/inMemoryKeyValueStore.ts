import { Iterator, KeyValueStore, BatchOperation } from './KeyValueStore'
import { Bytes, Option } from '../types'
import levelup from 'levelup'
import memdown from 'memdown'
import { AbstractIterator } from 'abstract-leveldown'

export class MemoryIterator implements Iterator {
  public iter: AbstractIterator<Bytes, Bytes>
  constructor(iter: AbstractIterator<Bytes, Bytes>) {
    this.iter = iter
  }
  public next(): Promise<Option<{ key: Bytes; value: Bytes }>> {
    return new Promise((resolve, reject) => {
      this.iter.next((err, key, value) => {
        if (err) {
          reject(err)
        } else {
          if (key) {
            resolve(Option.Some({ key, value }))
          } else {
            resolve(Option.None())
          }
        }
      })
    })
  }
}

export class InMemoryKeyValueStore implements KeyValueStore {
  public prefix: Bytes
  public db = levelup(memdown())

  constructor(prefix: Bytes) {
    this.prefix = prefix
  }

  public async get(key: Bytes): Promise<Option<Bytes>> {
    return new Promise((resolve, reject) => {
      this.db.get(this.getKey(key), { asBuffer: false }, (err, value) => {
        if (err) {
          return resolve(Option.None())
        } else {
          return resolve(Option.Some(value))
        }
      })
    })
  }

  public async put(key: Bytes, value: Bytes): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.put(this.getKey(key), value, err => {
        if (err) {
          return reject(err)
        } else {
          return resolve()
        }
      })
    })
  }

  public async del(key: Bytes): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.del(this.getKey(key), () => {
        Promise.resolve()
      })
    })
  }

  public async batch(operations: BatchOperation[]): Promise<void> {
    return new Promise((resolve, reject) => {
      let batch = this.db.batch()
      operations.forEach(op => {
        if (op.type == 'Put') {
          batch = batch.put(this.getKey(op.key), op.value)
        } else if (op.type == 'Del') {
          batch = batch.del(this.getKey(op.key))
        }
      })
      batch.write(() => {
        resolve()
      })
    })
  }

  public async iter(prefix: Bytes): Promise<MemoryIterator> {
    return new MemoryIterator(this.db.iterator({ gte: this.getKey(prefix) }))
  }

  public bucket(key: Bytes): KeyValueStore {
    return new InMemoryKeyValueStore(this.getKey(key))
  }

  private getKey(key: Bytes): Bytes {
    return this.prefix + key
  }
}
