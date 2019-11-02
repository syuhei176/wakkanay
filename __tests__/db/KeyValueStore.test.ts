import { InMemoryKeyValueStore } from '../../src/db'
import { Bytes } from '../../src/types/Codables'

describe('KeyValueStore', () => {
  const testDbName = Bytes.fromString('root')
  const testDbKey = Bytes.fromString('aaa')
  const testDbValue = Bytes.fromString('value')
  describe('get', () => {
    it('suceed to get', async () => {
      const kvs = new InMemoryKeyValueStore(testDbName)
      kvs.put(testDbKey, testDbValue)
      const result = await kvs.get(testDbKey)
      expect(result).not.toBeNull()
    })
    it('fail to get', async () => {
      const kvs = new InMemoryKeyValueStore(testDbName)
      const result = await kvs.get(testDbKey)
      expect(result).toBeNull()
    })
  })
  describe('iter', () => {
    it('suceed to next', async () => {
      const kvs = new InMemoryKeyValueStore(testDbName)
      kvs.put(testDbKey, testDbValue)
      const iter = await kvs.iter(testDbKey)
      const result = await iter.next()
      expect(result).not.toBeNull()
    })
    it('fail to next', async () => {
      const kvs = new InMemoryKeyValueStore(testDbName)
      const iter = await kvs.iter(testDbKey)
      const result = await iter.next()
      expect(result).toBeNull()
    })
  })
})
