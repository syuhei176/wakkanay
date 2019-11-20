// indexedDB key value store
// because our
//

import { KeyValueStore, Iterator, BatchOperation } from './KeyValueStore'
import { Bytes } from '../types/Codables'
const STORE_NAME = 'obj'
const STORE_KEY_PATH = 'key'

export class IndexedDbKeyValueStore implements KeyValueStore {
  private db: IDBDatabase | null = null
  private openPromise: Promise<IDBDatabase>

  constructor(name: Bytes = Bytes.fromString('db')) {
    this.openPromise = new Promise(resolve => {
      const req = indexedDB.open(name.intoString())
      req.onsuccess = () => {
        resolve(req.result)
      }
      req.onupgradeneeded = () => {
        req.result.createObjectStore(STORE_NAME, { keyPath: STORE_KEY_PATH })
      }
    })
  }

  private async getDb(): Promise<IDBDatabase> {
    return this.db || (await this.openPromise)
  }

  async get(key: Bytes): Promise<Bytes | null> {
    const db = await this.getDb()
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const req = store.get(key.intoString())

    return await new Promise(resolve => {
      req.onerror = () => {
        resolve(null)
      }
      req.onsuccess = () => {
        const result = req.result ? req.result.value : null
        resolve(result)
      }
    })
  }

  async put(key: Bytes, value: Bytes): Promise<void> {
    const db = await this.getDb()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.put(createKeyValue(key.intoString(), value))

    return new Promise((resolve, reject) => {
      tx.onerror = () => {
        reject(new Error('cannot complete put operation'))
      }
      tx.oncomplete = () => {
        resolve()
      }
    })
  }

  async del(key: Bytes): Promise<void> {
    const db = await this.getDb()
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    store.delete(key.intoString())
    return new Promise((resolve, reject) => {
      tx.onerror = () => {
        reject(new Error('cannot complete put operation'))
      }
      tx.oncomplete = () => {
        resolve()
      }
    })
  }

  async batch(operations: BatchOperation[]): Promise<void> {
    // console.log('batch')
  }
  iter(lowerBound: Bytes): Iterator {
    return { next: () => Promise.resolve(null) }
  }
  bucket(key: Bytes): KeyValueStore {
    return this
  }
}

// create key value pair to store in indexeddb
function createKeyValue(key: string, value: any) {
  return {
    key,
    value
  }
}
