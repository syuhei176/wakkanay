// indexedDB key value store
// because our
//

import { KeyValueStore, Iterator, BatchOperation } from './KeyValueStore'
import { Bytes } from '../types/Codables'
const STORE_KEY_PATH = 'key'

export class IndexedDbKeyValueStore implements KeyValueStore {
  private dbName: Bytes
  private db: IDBDatabase | null = null
  private openPromise: Promise<IDBDatabase>
  private storeKey: string

  constructor(
    name: Bytes = Bytes.fromString('db'),
    key = '_',
    version?: number
  ) {
    this.dbName = name
    this.storeKey = key
    this.openPromise = this.openDb(version)
  }

  private async openDb(version?: number): Promise<IDBDatabase> {
    return await new Promise(resolve => {
      const req = indexedDB.open(this.dbName.intoString(), version)

      req.onsuccess = () => {
        const db = req.result
        db.onversionchange = e => {
          this.db = null
          if (e.newVersion) {
            this.openPromise = this.openDb(e.newVersion)
          }
          db.close()
        }
        resolve(db)
      }

      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains(this.storeKey)) {
          req.result.createObjectStore(this.storeKey, {
            keyPath: STORE_KEY_PATH
          })
        }
      }
    })
  }

  private async getDb(): Promise<IDBDatabase> {
    return this.db || (await this.openPromise)
  }

  private async getVersion(): Promise<number> {
    const db = await this.getDb()
    return db.version
  }

  private async getObjectStoreNames(): Promise<DOMStringList> {
    const db = await this.getDb()
    return db.objectStoreNames
  }

  public async get(key: Bytes): Promise<Bytes | null> {
    const db = await this.getDb()
    const tx = db.transaction(this.storeKey, 'readonly')
    const store = tx.objectStore(this.storeKey)
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

  public async put(key: Bytes, value: Bytes): Promise<void> {
    const db = await this.getDb()
    const tx = db.transaction(this.storeKey, 'readwrite')
    const store = tx.objectStore(this.storeKey)
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

  public async del(key: Bytes): Promise<void> {
    const db = await this.getDb()
    const tx = db.transaction(this.storeKey, 'readwrite')
    const store = tx.objectStore(this.storeKey)
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

  public async batch(operations: BatchOperation[]): Promise<void> {
    // console.log('batch')
  }

  public iter(lowerBound: Bytes): Iterator {
    return { next: () => Promise.resolve(null) }
  }

  // use objectStore to manage bucket
  // each bucket has a bucket key as a private field for a key of global objectStore.
  // bucket(key) method returns a new IndexedDbKeyValueStore instance concatenating a given key
  // with parent key.
  // in order to add a new objectStore, bucket must pass new version number to constructor.
  public async bucket(key: Bytes): Promise<KeyValueStore> {
    let version
    const objectStoreNames = await this.getObjectStoreNames()
    const newObjectStoreKey = this.storeKey + key.intoString()
    if (!objectStoreNames.contains(newObjectStoreKey)) {
      version = (await this.getVersion()) + 1
    }

    return Promise.resolve(
      new IndexedDbKeyValueStore(this.dbName, newObjectStoreKey, version)
    )
  }

  public async close(): Promise<void> {
    return await new Promise(resolve => {
      if (this.db) {
        this.db.close()
        this.db.onclose = () => {
          resolve()
        }
      } else {
        resolve()
      }
    })
  }
}

// create key value pair to store in indexeddb
function createKeyValue(key: string, value: any) {
  return {
    key,
    value
  }
}
