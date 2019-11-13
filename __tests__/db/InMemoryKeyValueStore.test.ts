import { InMemoryKeyValueStore, KeyValueStore } from '../../src/db'
import { Bytes } from '../../src/types/Codables'

describe('InMemoryKeyValueStore', () => {
  const testDbName = Bytes.fromString('root')
  const testDbKey = Bytes.fromString('aaa')
  const testDbValue = Bytes.fromString('value')
  describe('get', () => {
    it('suceed to get', async () => {
      const kvs = new InMemoryKeyValueStore(testDbName)
      kvs.put(testDbKey, testDbValue)
      const result = await kvs.get(testDbKey)
      expect(result).toEqual(testDbValue)
    })
    it('fail to get', async () => {
      const kvs = new InMemoryKeyValueStore(testDbName)
      const result = await kvs.get(testDbKey)
      expect(result).toBeNull()
    })
  })
  describe('del', () => {
    it('suceed to del', async () => {
      const kvs = new InMemoryKeyValueStore(testDbName)
      await kvs.put(testDbKey, testDbValue)
      await kvs.del(testDbKey)
      const result = await kvs.get(testDbKey)
      expect(result).toBeNull()
    })
    it('delete key which does not exist', async () => {
      const kvs = new InMemoryKeyValueStore(testDbName)
      await kvs.del(testDbKey)
    })
  })
  describe('iter', () => {
    const testDbKey0 = Bytes.fromString('0')
    const testDbKey1 = Bytes.fromString('1')
    const testDbKey2 = Bytes.fromString('2')
    let kvs: KeyValueStore
    beforeEach(async () => {
      kvs = new InMemoryKeyValueStore(testDbName)
      await kvs.put(testDbKey0, testDbKey0)
      await kvs.put(testDbKey1, testDbKey1)
      await kvs.put(testDbKey2, testDbKey2)
    })
    it('suceed to next', async () => {
      await kvs.put(testDbKey, testDbValue)
      const iter = kvs.iter(testDbKey)
      const result = await iter.next()
      expect(result).not.toBeNull()
    })
    it('end of iterator', async () => {
      const iter = kvs.iter(testDbKey)
      const result = await iter.next()
      expect(result).toBeNull()
    })
    it('get ordered keys', async () => {
      const iter = kvs.iter(testDbKey0)
      const result0 = await iter.next()
      const result1 = await iter.next()
      expect(result0).not.toBeNull()
      expect(result1).not.toBeNull()
      if (result0 !== null && result1 !== null) {
        expect(result0.key).toEqual(testDbKey0)
        expect(result0.value).toEqual(testDbKey0)
        expect(result1.key).toEqual(testDbKey1)
        expect(result1.value).toEqual(testDbKey1)
      }
    })
  })
  describe('bucket', () => {
    it('suceed to get bucket', async () => {
      const kvs = new InMemoryKeyValueStore(testDbName)
      const bucket = kvs.bucket(testDbKey)
      await bucket.put(testDbKey, testDbValue)
      const value = await bucket.get(testDbKey)
      expect(value).toEqual(testDbValue)
    })
  })
})
