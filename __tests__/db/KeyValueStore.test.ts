import { InMemoryKeyValueStore } from '../../src/db'
import { Bytes } from '../../src/types/Codables'

describe('KeyValueStore', () => {
  const dbName = Bytes.fromString('root')
  const dbKey = Bytes.fromString('aaa')
  const dbValue = Bytes.fromString('value')
  describe('get', () => {
    it('suceed to get', async () => {
      const kvs = new InMemoryKeyValueStore(dbName)
      kvs.put(dbKey, dbValue)
      const result = await kvs.get(dbKey)
      expect(result).not.toBeNull()
    })
    it('fail to get', async () => {
      const kvs = new InMemoryKeyValueStore(dbName)
      const result = await kvs.get(dbKey)
      expect(result).toBeNull()
    })
  })
  describe('iter', () => {
    it('suceed to next', async () => {
      const kvs = new InMemoryKeyValueStore(dbName)
      kvs.put(dbKey, dbValue)
      const iter = await kvs.iter(dbKey)
      const result = await iter.next()
      expect(result).not.toBeNull()
    })
    it('fail to next', async () => {
      const kvs = new InMemoryKeyValueStore(dbName)
      const iter = await kvs.iter(dbKey)
      const result = await iter.next()
      expect(result).toBeNull()
    })
  })
})
