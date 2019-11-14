import { Iterator, KeyValueStore, BatchOperation } from './KeyValueStore'
import { Bytes } from '../types/Codables'
import levelup, { LevelUp } from 'levelup'
import memdown from 'memdown'
import { AbstractIterator } from 'abstract-leveldown'

export class MemoryIterator implements Iterator {
  public iter: AbstractIterator<Uint8Array, Uint8Array>
  private prefix: Bytes
  constructor(iter: AbstractIterator<Uint8Array, Uint8Array>, prefix: Bytes) {
    this.iter = iter
    this.prefix = prefix
  }
  public next(): Promise<{ key: Bytes; value: Bytes } | null> {
    return new Promise((resolve, reject) => {
      this.iter.next((err, key, value) => {
        if (err) {
          reject(err)
        } else {
          if (key) {
            resolve({
              key: this.removePrefix(Bytes.from(Uint8Array.from(key))),
              value: Bytes.from(Uint8Array.from(value))
            })
          } else {
            resolve(null)
          }
        }
      })
    })
  }
  removePrefix(key: Bytes): Bytes {
    return Bytes.from(key.data.slice(this.prefix.data.length))
  }
}

export class InMemoryKeyValueStore implements KeyValueStore {
  /*
   * `dbName` is optional to distinguish root kvs which has db connection and bucket.
   * root kvs has dbName but bucket doesn't have.
   */
  public dbName?: Bytes
  public prefix: Bytes = Bytes.default()
  public db: LevelUp

  constructor(prefix: Bytes, db?: LevelUp) {
    if (db) {
      this.prefix = prefix
      this.db = db
    } else {
      this.dbName = prefix
      this.db = levelup(memdown())
    }
  }

  public async get(key: Bytes): Promise<Bytes | null> {
    return new Promise(resolve => {
      this.db.get(Buffer.from(this.getKey(key).data), (err, value) => {
        if (err) {
          return resolve(null)
        } else {
          return resolve(Bytes.from(Uint8Array.from(value)))
        }
      })
    })
  }

  public async put(key: Bytes, value: Bytes): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.put(
        Buffer.from(this.getKey(key).data),
        Buffer.from(value.data),
        err => {
          if (err) {
            return reject(err)
          } else {
            return resolve()
          }
        }
      )
    })
  }

  public async del(key: Bytes): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.del(Buffer.from(this.getKey(key).data), err => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })
  }

  public async batch(operations: BatchOperation[]): Promise<void> {
    return new Promise(resolve => {
      let batch = this.db.batch()
      operations.forEach(op => {
        if (op.type === 'Put') {
          batch = batch.put(
            Buffer.from(this.getKey(op.key).data),
            Buffer.from(op.value.data)
          )
        } else if (op.type === 'Del') {
          batch = batch.del(Buffer.from(this.getKey(op.key).data))
        }
      })
      batch.write(() => {
        resolve()
      })
    })
  }

  public iter(prefix: Bytes): MemoryIterator {
    return new MemoryIterator(
      this.db.iterator({
        gte: Buffer.from(this.getKey(prefix).data),
        reverse: false,
        keys: true,
        values: true,
        keyAsBuffer: true,
        valueAsBuffer: true
      }),
      this.prefix
    )
  }

  public bucket(key: Bytes): KeyValueStore {
    return new InMemoryKeyValueStore(this.getKey(key))
  }

  private getKey(key: Bytes): Bytes {
    return Bytes.concat(this.prefix, key)
  }
}
