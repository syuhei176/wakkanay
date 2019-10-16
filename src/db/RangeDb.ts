import { Bytes } from '../types'
import { RangeStore } from './RangeStore'
import { BatchOperation, KeyValueStore } from './KeyValueStore'
import { RangeRecord as Range } from './RangeStore'

export class RangeDb implements RangeStore {
  public kvs: KeyValueStore
  constructor(kvs: KeyValueStore) {
    this.kvs = kvs
  }

  public async get(start: number, end: number): Promise<Range[]> {
    const iter = await this.kvs.iter(start.toString())
    const keyValueOpt = await iter.next()
    if (!keyValueOpt.isSome()) {
      return []
    }
    const keyValue = keyValueOpt.unwrap()
    const ranges = []
    let range = Range.decode(keyValue.value.toString())
    while (range.intersect(start, end)) {
      ranges.push(range)
      const keyValueOpt = await iter.next()
      if (!keyValueOpt.isSome()) {
        break
      }
      const keyValue = keyValueOpt.unwrap()
      range = Range.decode(keyValue.value.toString())
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
      const last_range = inputRanges[inputRanges.length - 1]
      if (end < last_range.end) {
        outputRanges.push(new Range(end, last_range.end, last_range.value))
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
        key: r.end.toString()
      }
    })
    await this.kvs.batch(ops)
    return ranges
  }

  private async putBatch(ranges: Range[]): Promise<void> {
    const ops: BatchOperation[] = ranges.map(r => {
      return {
        type: 'Put',
        key: r.end.toString(),
        value: r.encode()
      }
    })
    return this.kvs.batch(ops)
  }
}
