import { InMemoryKeyValueStore } from '@cryptoeconomicslab/level-kvs'
import { EventDb } from '../src'
import { Bytes } from '@cryptoeconomicslab/primitives'

describe('EventDb', () => {
  const dbName = Bytes.fromString('root')
  const topic = Bytes.fromString('topic')
  it('default last logged block should be 0', async () => {
    const kvs = new InMemoryKeyValueStore(dbName)
    const eventDb = new EventDb(kvs)
    const block = await eventDb.getLastLoggedBlock(topic)
    expect(block).toEqual(0)
  })
  it('succeed to setLastLoggedBlock', async () => {
    const kvs = new InMemoryKeyValueStore(dbName)
    const eventDb = new EventDb(kvs)
    await eventDb.setLastLoggedBlock(topic, 100)
    const block = await eventDb.getLastLoggedBlock(topic)
    expect(block).toEqual(100)
  })
})
