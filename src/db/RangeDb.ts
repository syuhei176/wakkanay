import { Bytes } from '../types/Codables'
import { RangeStore, RangeRecord as Range } from './RangeStore'
import { BatchOperation, KeyValueStore } from './KeyValueStore'

export class RangeDb implements RangeStore {
  public kvs: KeyValueStore
  constructor(kvs: KeyValueStore) {
    this.kvs = kvs
  }

  public async get(start: number, end: number): Promise<Range[]> {
    const iter = await this.kvs.iter(Bytes.fromString(start.toString()))
    const keyValue = await iter.next()
    if (keyValue === null) {
      return []
    }

    const ranges = []
    let range = Range.decode(keyValue.value)
    while (range.intersect(start, end)) {
      ranges.push(range)
      const keyValue = await iter.next()
      if (keyValue === null) {
        break
      }
      range = Range.decode(keyValue.value)
    }
    return ranges
  }

  public async put(start: number, end: number, value: Bytes): Promise<void> {
    const inputRanges = await this.delBatch(start, end)
    const outputRanges = []
    if (inputRanges.length > 0 && inputRanges[0].start < start) {
      outputRanges.push(
        new Range(inputRanges[0].start, start, inputRanges[0].value)
      )
    }
    if (inputRanges.length > 0) {
      const lastRange = inputRanges[inputRanges.length - 1]
      if (end < lastRange.end) {
        outputRanges.push(new Range(end, lastRange.end, lastRange.value))
      }
    }
    outputRanges.push(new Range(start, end, value))
    return this.putBatch(outputRanges)
  }

  public async del(start: number, end: number): Promise<void> {
    await this.delBatch(start, end)
    return
  }

  public bucket(key: Bytes): RangeStore {
    return new RangeDb(this.kvs.bucket(key))
  }

  private async delBatch(start: number, end: number): Promise<Range[]> {
    const ranges = await this.get(start, end)
    const ops: BatchOperation[] = ranges.map(r => {
      return {
        type: 'Del',
        key: Bytes.fromString(r.end.toString())
      }
    })
    await this.kvs.batch(ops)
    return ranges
  }

  private async putBatch(ranges: Range[]): Promise<void> {
    const ops: BatchOperation[] = ranges.map(r => {
      return {
        type: 'Put',
        key: Bytes.fromString(r.end.toString()),
        value: r.encode()
      }
    })
    return this.kvs.batch(ops)
  }
}
