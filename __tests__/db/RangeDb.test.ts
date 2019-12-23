import { InMemoryKeyValueStore, RangeDb } from '../../src/db'
import { Bytes } from '../../src/types/Codables'
import { RangeRecord } from '../../src/db/RangeStore'

describe('RangeDb', () => {
  let kvs: InMemoryKeyValueStore
  let rangeDb: RangeDb
  const testDbName = Bytes.fromString('root')
  const alice = Bytes.fromString('alice')
  const bob = Bytes.fromString('bob')
  const carol = Bytes.fromString('carol')
  beforeEach(async () => {
    kvs = new InMemoryKeyValueStore(testDbName)
    await kvs.open()
    rangeDb = new RangeDb(kvs)
  })
  afterEach(async () => {
    await kvs.close()
  })
  it('get ranges', async () => {
    await rangeDb.put(0n, 100n, alice)
    await rangeDb.put(100n, 200n, bob)
    await rangeDb.put(200n, 300n, carol)
    const ranges = await rangeDb.get(0n, 300n)
    expect(ranges.length).toEqual(3)
  })
  it('get mid range', async () => {
    await rangeDb.put(0n, 10n, alice)
    await rangeDb.put(10n, 20n, bob)
    await rangeDb.put(20n, 30n, carol)
    const ranges = await rangeDb.get(10n, 15n)
    expect(ranges.length).toEqual(1)
  })
  it('get small range', async () => {
    await rangeDb.put(120n, 150n, alice)
    await rangeDb.put(0n, 20n, bob)
    await rangeDb.put(500n, 600n, carol)
    const ranges = await rangeDb.get(100n, 200n)
    expect(ranges.length).toEqual(1)
  })
  it('get large range', async () => {
    await rangeDb.put(0n, 500n, alice)
    const ranges = await rangeDb.get(100n, 200n)
    expect(ranges.length).toEqual(1)
  })
  it("don't get edge", async () => {
    await rangeDb.put(80n, 100n, alice)
    const ranges = await rangeDb.get(100n, 200n)
    expect(ranges.length).toEqual(0)
  })
  it('del ranges', async () => {
    await rangeDb.put(0n, 100n, alice)
    await rangeDb.put(100n, 200n, bob)
    await rangeDb.put(200n, 300n, carol)
    await rangeDb.del(0n, 300n)
    const ranges = await rangeDb.get(0n, 300n)
    expect(ranges.length).toEqual(0)
  })
  it('update range', async () => {
    await rangeDb.put(0n, 300n, alice)
    await rangeDb.put(100n, 200n, bob)
    const ranges = await rangeDb.get(0n, 300n)
    expect(ranges).toEqual([
      new RangeRecord(0n, 100n, alice),
      new RangeRecord(100n, 200n, bob),
      new RangeRecord(200n, 300n, alice)
    ])
  })
  describe('get', () => {
    const bigNumberStart = 2n ** 34n
    const bigNumberEnd = 2n ** 34n + 500n
    beforeEach(async () => {
      await rangeDb.put(bigNumberStart, bigNumberEnd, alice)
    })
    it('get a range whose start and end are more than 8 bytes', async () => {
      const ranges = await rangeDb.get(bigNumberStart, bigNumberStart + 1000n)
      expect(ranges).toEqual([
        new RangeRecord(bigNumberStart, bigNumberEnd, alice)
      ])
    })
    it('get no ranges', async () => {
      const ranges = await rangeDb.get(2n ** 32n, 2n ** 32n + 1000n)
      expect(ranges.length).toEqual(0)
    })
  })
  describe('put', () => {
    const bigNumberIndex1 = 2n ** 34n
    const bigNumberIndex2 = bigNumberIndex1 + 1000n
    const bigNumberIndex3 = bigNumberIndex1 + 2000n
    beforeEach(async () => {
      await rangeDb.put(bigNumberIndex1, bigNumberIndex2, alice)
      await rangeDb.put(bigNumberIndex2, bigNumberIndex3, bob)
    })
    it('put to former', async () => {
      await rangeDb.put(bigNumberIndex1, bigNumberIndex1 + 500n, carol)
      const ranges = await rangeDb.get(bigNumberIndex1, bigNumberIndex3)
      expect(ranges).toEqual([
        new RangeRecord(bigNumberIndex1, bigNumberIndex1 + 500n, carol),
        new RangeRecord(bigNumberIndex1 + 500n, bigNumberIndex2, alice),
        new RangeRecord(bigNumberIndex2, bigNumberIndex3, bob)
      ])
    })
    it('put to middle', async () => {
      await rangeDb.put(bigNumberIndex1 + 200n, bigNumberIndex1 + 500n, carol)
      const ranges = await rangeDb.get(bigNumberIndex1, bigNumberIndex3)
      expect(ranges).toEqual([
        new RangeRecord(bigNumberIndex1, bigNumberIndex1 + 200n, alice),
        new RangeRecord(bigNumberIndex1 + 200n, bigNumberIndex1 + 500n, carol),
        new RangeRecord(bigNumberIndex1 + 500n, bigNumberIndex2, alice),
        new RangeRecord(bigNumberIndex2, bigNumberIndex3, bob)
      ])
    })
    it('put to later', async () => {
      await rangeDb.put(bigNumberIndex1 + 500n, bigNumberIndex2, carol)
      const ranges = await rangeDb.get(bigNumberIndex1, bigNumberIndex3)
      expect(ranges).toEqual([
        new RangeRecord(bigNumberIndex1, bigNumberIndex1 + 500n, alice),
        new RangeRecord(bigNumberIndex1 + 500n, bigNumberIndex2, carol),
        new RangeRecord(bigNumberIndex2, bigNumberIndex3, bob)
      ])
    })
    it('put across', async () => {
      await rangeDb.put(bigNumberIndex1 + 500n, bigNumberIndex2 + 500n, carol)
      const ranges = await rangeDb.get(bigNumberIndex1, bigNumberIndex3)
      expect(ranges).toEqual([
        new RangeRecord(bigNumberIndex1, bigNumberIndex1 + 500n, alice),
        new RangeRecord(bigNumberIndex1 + 500n, bigNumberIndex2 + 500n, carol),
        new RangeRecord(bigNumberIndex2 + 500n, bigNumberIndex3, bob)
      ])
    })
  })
})
