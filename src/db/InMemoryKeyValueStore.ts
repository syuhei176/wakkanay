import { Iterator, KeyValueStore, BatchOperation } from './KeyValueStore'
import { Bytes } from '../types/Codables'
import levelup, { LevelUp } from 'levelup'
import memdown from 'memdown'
import { AbstractIterator } from 'abstract-leveldown'

export class MemoryIterator implements Iterator {
  public iter: AbstractIterator<Buffer, Buffer>
  private parentKvs: InMemoryKeyValueStore
  constructor(
    iter: AbstractIterator<Buffer, Buffer>,
    parentKvs: InMemoryKeyValueStore
  ) {
    this.iter = iter
    this.parentKvs = parentKvs
  }
  public next(): Promise<{ key: Bytes; value: Bytes } | null> {
    return new Promise((resolve, reject) => {
      this.iter.next((err, key, value) => {
        if (err) {
          reject(err)
        } else {
          if (key) {
            resolve({
              key: this.parentKvs.getKeyFromBuffer(key),
              value: InMemoryKeyValueStore.getValueFromBuffer(value)
            })
          } else {
            resolve(null)
          }
        }
      })
    })
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
      this.db.get(this.convertKeyIntoBuffer(key), (err, value) => {
        if (err) {
          return resolve(null)
        } else {
          return resolve(InMemoryKeyValueStore.getValueFromBuffer(value))
        }
      })
    })
  }

  public async put(key: Bytes, value: Bytes): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.put(
        this.convertKeyIntoBuffer(key),
        InMemoryKeyValueStore.convertValueIntoBuffer(value),
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
      this.db.del(this.convertKeyIntoBuffer(key), err => {
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
            this.convertKeyIntoBuffer(op.key),
            InMemoryKeyValueStore.convertValueIntoBuffer(op.value)
          )
        } else if (op.type === 'Del') {
          batch = batch.del(this.convertKeyIntoBuffer(op.key))
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
        gte: this.convertKeyIntoBuffer(prefix),
        reverse: false,
        keys: true,
        values: true,
        keyAsBuffer: true,
        valueAsBuffer: true
      }),
      this
    )
  }

  public bucket(key: Bytes): KeyValueStore {
    return new InMemoryKeyValueStore(this.concatKeyWithPrefix(key))
  }

  private concatKeyWithPrefix(key: Bytes): Bytes {
    return Bytes.concat(this.prefix, key)
  }

  private convertKeyIntoBuffer(key: Bytes): Buffer {
    return Buffer.from(this.concatKeyWithPrefix(key).data)
  }

  private static convertValueIntoBuffer(value: Bytes): Buffer {
    return Buffer.from(value.data)
  }

  /**
   * Converts key to Bytes and remove current prefix from key to get correct key inside bucket.
   * @param key
   */
  public getKeyFromBuffer(key: Buffer): Bytes {
    return this.removePrefix(Bytes.from(Uint8Array.from(key)))
  }

  public static getValueFromBuffer(value: Buffer): Bytes {
    return Bytes.from(Uint8Array.from(value))
  }

  private removePrefix(key: Bytes): Bytes {
    return Bytes.from(key.data.slice(this.prefix.data.length))
  }
}
