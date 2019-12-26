import { InMemoryKeyValueStore, RangeDb } from '../../src/db'
import { Bytes } from '../../src/types/Codables'
import { RangeRecord, RangeStore } from '../../src/db/RangeStore'

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

  describe('createKey', () => {
    it('return key', async () => {
      expect(RangeDb.createKey(0x1234n)).toEqual(
        Bytes.fromHexString(
          '0x0000000000000000000000000000000000000000000000000000000000001234'
        )
      )
      expect(RangeDb.createKey(0x1200n)).toEqual(
        Bytes.fromHexString(
          '0x0000000000000000000000000000000000000000000000000000000000001200'
        )
      )
      expect(RangeDb.createKey(0x120n)).toEqual(
        Bytes.fromHexString(
          '0x0000000000000000000000000000000000000000000000000000000000000120'
        )
      )
    })
  })

  describe.each([0n, 2n ** 100n])('baseStart: %p', baseStart => {
    function testPut(store: RangeStore, s: bigint, e: bigint, value: Bytes) {
      return store.put(baseStart + s, baseStart + e, value)
    }
    function testGet(store: RangeStore, s: bigint, e: bigint) {
      return store.get(baseStart + s, baseStart + e)
    }
    function testDel(store: RangeStore, s: bigint, e: bigint) {
      return store.del(baseStart + s, baseStart + e)
    }
    function testRangeRecord(s: bigint, e: bigint, value: Bytes) {
      return new RangeRecord(baseStart + s, baseStart + e, value)
    }

    describe('bucket', () => {
      let bucketA: RangeStore
      let bucketB: RangeStore
      beforeEach(async () => {
        bucketA = await rangeDb.bucket(Bytes.fromString('a'))
        bucketB = await rangeDb.bucket(Bytes.fromString('b'))
      })
      it('buckets are independent', async () => {
        await testPut(rangeDb, 0n, 100n, alice)
        await testPut(bucketA, 100n, 200n, bob)
        await testPut(bucketB, 200n, 300n, carol)
        const ranges = await testGet(rangeDb, 0n, 300n)
        const rangesA = await testGet(bucketA, 0n, 300n)
        const rangesB = await testGet(bucketB, 0n, 300n)
        // TODO: fix spec
        // expect(ranges).toEqual([testRangeRecord(0n, 100n, alice)])
        // or
        // expect(ranges).toEqual([
        //   testRangeRecord(0n, 100n, alice),
        //   testRangeRecord(100n, 200n, bob),
        //   testRangeRecord(200n, 300n, carol)
        // ])
        expect(rangesA).toEqual([testRangeRecord(100n, 200n, bob)])
        expect(rangesB).toEqual([testRangeRecord(200n, 300n, carol)])
      })
    })

    describe.each(['rangedb', 'bucket'])('RangeStoreType: %p', testDbType => {
      let rangeStore: RangeStore

      beforeEach(async () => {
        rangeStore = rangeDb
        if (testDbType == 'bucket') {
          rangeStore = await rangeStore.bucket(Bytes.fromString('test_bucket'))
        }
      })

      describe('get', () => {
        it('get a range', async () => {
          await testPut(rangeStore, 0n, 500n, alice)
          const ranges = await testGet(rangeStore, 0n, 1000n)
          expect(ranges).toEqual([testRangeRecord(0n, 500n, alice)])
        })
        it('get ranges', async () => {
          await testPut(rangeStore, 0n, 100n, alice)
          await testPut(rangeStore, 100n, 200n, bob)
          await testPut(rangeStore, 200n, 300n, carol)
          const ranges = await testGet(rangeStore, 0n, 300n)
          expect(ranges).toEqual([
            testRangeRecord(0n, 100n, alice),
            testRangeRecord(100n, 200n, bob),
            testRangeRecord(200n, 300n, carol)
          ])
        })
        it('get mid range', async () => {
          await testPut(rangeStore, 0n, 100n, alice)
          await testPut(rangeStore, 100n, 200n, bob)
          await testPut(rangeStore, 200n, 300n, carol)
          const ranges = await testGet(rangeStore, 100n, 150n)
          expect(ranges).toEqual([testRangeRecord(100n, 200n, bob)])
        })
        it('get small range', async () => {
          await testPut(rangeStore, 120n, 150n, alice)
          await testPut(rangeStore, 0n, 20n, bob)
          await testPut(rangeStore, 500n, 600n, carol)
          const ranges = await testGet(rangeStore, 100n, 200n)
          expect(ranges).toEqual([testRangeRecord(120n, 150n, alice)])
        })
        it('get large range', async () => {
          await testPut(rangeStore, 0n, 500n, alice)
          const ranges = await testGet(rangeStore, 100n, 200n)
          expect(ranges).toEqual([testRangeRecord(0n, 500n, alice)])
        })
        it('get no ranges', async () => {
          await testPut(rangeStore, 0n, 500n, alice)
          const ranges = await testGet(rangeStore, 1000n, 2000n)
          expect(ranges).toEqual([])
        })
        it('get no ranges edge case, later query', async () => {
          await testPut(rangeStore, 0n, 500n, alice)
          const ranges = await testGet(rangeStore, 500n, 1000n)
          expect(ranges).toEqual([])
        })
        it('get no ranges edge case, fomer query', async () => {
          await testPut(rangeStore, 500n, 1000n, alice)
          const ranges = await testGet(rangeStore, 0n, 500n)
          expect(ranges).toEqual([])
        })

        it('get ranges correctly', async () => {
          await rangeStore.put(0x100n, 0x120n, alice)
          await rangeStore.put(0x120n, 0x200n, bob)
          await rangeStore.put(0x1000n, 0x1200n, carol)
          const ranges = await rangeStore.get(0n, 0x2000n)
          expect(ranges).toEqual([
            new RangeRecord(0x100n, 0x120n, alice),
            new RangeRecord(0x120n, 0x200n, bob),
            new RangeRecord(0x1000n, 0x1200n, carol)
          ])
        })
      })

      describe('put', () => {
        beforeEach(async () => {
          await testPut(rangeStore, 0n, 1000n, alice)
          await testPut(rangeStore, 1000n, 2000n, bob)
        })
        it('put to former', async () => {
          await testPut(rangeStore, 0n, 500n, carol)
          const ranges = await testGet(rangeStore, 0n, 2000n)
          expect(ranges).toEqual([
            testRangeRecord(0n, 500n, carol),
            testRangeRecord(500n, 1000n, alice),
            testRangeRecord(1000n, 2000n, bob)
          ])
        })
        it('put to middle', async () => {
          await testPut(rangeStore, 200n, 500n, carol)
          const ranges = await testGet(rangeStore, 0n, 2000n)
          expect(ranges).toEqual([
            testRangeRecord(0n, 200n, alice),
            testRangeRecord(200n, 500n, carol),
            testRangeRecord(500n, 1000n, alice),
            testRangeRecord(1000n, 2000n, bob)
          ])
        })
        it('put to later', async () => {
          await testPut(rangeStore, 500n, 1000n, carol)
          const ranges = await testGet(rangeStore, 0n, 2000n)
          expect(ranges).toEqual([
            testRangeRecord(0n, 500n, alice),
            testRangeRecord(500n, 1000n, carol),
            testRangeRecord(1000n, 2000n, bob)
          ])
        })
        it('put across', async () => {
          await testPut(rangeStore, 500n, 1500n, carol)
          const ranges = await testGet(rangeStore, 0n, 2000n)
          expect(ranges).toEqual([
            testRangeRecord(0n, 500n, alice),
            testRangeRecord(500n, 1500n, carol),
            testRangeRecord(1500n, 2000n, bob)
          ])
        })
      })

      describe('del', () => {
        it('del ranges', async () => {
          await testPut(rangeStore, 0n, 100n, alice)
          await testPut(rangeStore, 100n, 200n, bob)
          await testPut(rangeStore, 200n, 300n, carol)
          await testDel(rangeStore, 0n, 300n)
          const ranges = await testGet(rangeStore, 0n, 300n)
          expect(ranges).toEqual([])
        })

        it('del middle range', async () => {
          await testPut(rangeStore, 0n, 100n, alice)
          await testDel(rangeStore, 10n, 20n)
          const ranges = await testGet(rangeStore, 0n, 100n)
          // del method is not used in public, no correct spec exists.
          expect(ranges).toEqual([])
        })
      })
    })
  })
})
