import { Iterator, KeyValueStore, BatchOperation } from './KeyValueStore'
import { Bytes } from '../types/Codables'
import levelup from 'levelup'
import memdown from 'memdown'
import { AbstractIterator } from 'abstract-leveldown'

export class MemoryIterator implements Iterator {
  public iter: AbstractIterator<string, string>
  constructor(iter: AbstractIterator<string, string>) {
    this.iter = iter
  }
  public next(): Promise<{ key: Bytes; value: Bytes } | null> {
    return new Promise((resolve, reject) => {
      this.iter.next((err, key, value) => {
        if (err) {
          reject(err)
        } else {
          if (key) {
            resolve({
              key: Bytes.fromString(key),
              value: Bytes.fromString(value)
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
  public prefix: Bytes = Bytes.default()
  public db = levelup(memdown())

  constructor(prefix: Bytes) {
    this.prefix = prefix
  }

  public async get(key: Bytes): Promise<Bytes | null> {
    return new Promise(resolve => {
      this.db.get(
        this.getKey(key).intoString(),
        { asBuffer: false },
        (err, value) => {
          if (err) {
            return resolve(null)
          } else {
            return resolve(Bytes.fromString(value))
          }
        }
      )
    })
  }

  public async put(key: Bytes, value: Bytes): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.put(this.getKey(key).intoString(), value.intoString(), err => {
        if (err) {
          return reject(err)
        } else {
          return resolve()
        }
      })
    })
  }

  public async del(key: Bytes): Promise<void> {
    return new Promise(() => {
      this.db.del(this.getKey(key).intoString(), () => {
        Promise.resolve()
      })
    })
  }

  public async batch(operations: BatchOperation[]): Promise<void> {
    return new Promise(resolve => {
      let batch = this.db.batch()
      operations.forEach(op => {
        if (op.type === 'Put') {
          batch = batch.put(
            this.getKey(op.key).intoString(),
            op.value.intoString()
          )
        } else if (op.type === 'Del') {
          batch = batch.del(this.getKey(op.key).intoString())
        }
      })
      batch.write(() => {
        resolve()
      })
    })
  }

  public async iter(prefix: Bytes): Promise<MemoryIterator> {
    return new MemoryIterator(
      this.db.iterator({ gte: this.getKey(prefix).intoString() })
    )
  }

  public bucket(key: Bytes): KeyValueStore {
    return new InMemoryKeyValueStore(this.getKey(key))
  }

  private getKey(key: Bytes): Bytes {
    return Bytes.concat(this.prefix, key)
  }
}
