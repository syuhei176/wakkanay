import { InMemoryKeyValueStore } from '../../src/db'

describe('KeyValueStore', () => {
  describe('get', () => {
    it('suceed to get', async () => {
      const kvs = new InMemoryKeyValueStore('root')
      kvs.put('aaa', 'value')
      const result = await kvs.get('aaa')
      expect(result.isSome()).toEqual(true)
    })
    it('fail to get', async () => {
      const kvs = new InMemoryKeyValueStore('root')
      const result = await kvs.get('aaa')
      expect(result.isSome()).toEqual(false)
    })
  })
  describe('iter', () => {
    it('suceed to next', async () => {
      const kvs = new InMemoryKeyValueStore('root')
      kvs.put('aaa', 'value')
      const iter = await kvs.iter('aaa')
      const result = await iter.next()
      expect(result.isSome()).toEqual(true)
    })
    it('fail to next', async () => {
      const kvs = new InMemoryKeyValueStore('root')
      const iter = await kvs.iter('aaa')
      const result = await iter.next()
      expect(result.isSome()).toEqual(false)
    })
  })
})
