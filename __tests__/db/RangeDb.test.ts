import { InMemoryKeyValueStore, RangeDb } from '../../src/db'
import { Bytes } from '../../src/types/Codables'

describe('RangeDb', () => {
  const testDbName = Bytes.fromString('root')
  const alice = Bytes.fromString('alice')
  const bob = Bytes.fromString('bob')
  const carol = Bytes.fromString('carol')
  it('get ranges', async () => {
    const kvs = new InMemoryKeyValueStore(testDbName)
    const rangeDb = new RangeDb(kvs)
    await rangeDb.put(0n, 100n, alice)
    await rangeDb.put(100n, 200n, bob)
    await rangeDb.put(200n, 300n, carol)
    const ranges = await rangeDb.get(0n, 300n)
    expect(ranges.length).toEqual(3)
  })
  it('get small range', async () => {
    const kvs = new InMemoryKeyValueStore(testDbName)
    const rangeDb = new RangeDb(kvs)
    await rangeDb.put(120n, 150n, alice)
    await rangeDb.put(0n, 20n, bob)
    await rangeDb.put(500n, 600n, carol)
    const ranges = await rangeDb.get(100n, 200n)
    expect(ranges.length).toEqual(1)
  })
  it('get large range', async () => {
    const kvs = new InMemoryKeyValueStore(testDbName)
    const rangeDb = new RangeDb(kvs)
    await rangeDb.put(0n, 500n, alice)
    const ranges = await rangeDb.get(100n, 200n)
    expect(ranges.length).toEqual(1)
  })
  it("don't get edge", async () => {
    const kvs = new InMemoryKeyValueStore(testDbName)
    const rangeDb = new RangeDb(kvs)
    await rangeDb.put(80n, 100n, alice)
    const ranges = await rangeDb.get(100n, 200n)
    expect(ranges.length).toEqual(0)
  })
  it('del ranges', async () => {
    const kvs = new InMemoryKeyValueStore(testDbName)
    const rangeDb = new RangeDb(kvs)
    await rangeDb.put(0n, 100n, alice)
    await rangeDb.put(100n, 200n, bob)
    await rangeDb.put(200n, 300n, carol)
    await rangeDb.del(0n, 300n)
    const ranges = await rangeDb.get(0n, 300n)
    expect(ranges.length).toEqual(0)
  })
  it('update range', async () => {
    const kvs = new InMemoryKeyValueStore(testDbName)
    const rangeDb = new RangeDb(kvs)
    await rangeDb.put(0n, 300n, alice)
    await rangeDb.put(100n, 200n, bob)
    const ranges = await rangeDb.get(0n, 300n)
    expect(ranges.length).toEqual(3)
    expect(ranges[0].value).toEqual(alice)
    expect(ranges[1].value).toEqual(bob)
    expect(ranges[2].value).toEqual(alice)
  })
  describe('get', () => {
    let kvs: InMemoryKeyValueStore
    let rangeDb: RangeDb
    const bigNumberStart = 2n ** 34n
    const bigNumberEnd = 2n ** 34n + 500n
    beforeEach(async () => {
      kvs = new InMemoryKeyValueStore(testDbName)
      rangeDb = new RangeDb(kvs)
      await rangeDb.put(bigNumberStart, bigNumberEnd, alice)
    })
    it('get a range whose start and end are more than 8 bytes', async () => {
      const ranges = await rangeDb.get(bigNumberStart, bigNumberStart + 1000n)
      expect(ranges.length).toEqual(1)
    })
    it('get no ranges', async () => {
      const ranges = await rangeDb.get(2n ** 32n, 2n ** 32n + 1000n)
      expect(ranges.length).toEqual(0)
    })
  })
})
