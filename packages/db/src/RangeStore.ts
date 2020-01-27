import { BigNumber, Bytes } from '@cryptoeconomicslab/primitives'
import { BigIntMath } from '@cryptoeconomicslab/utils'

export class RangeRecord {
  public static decode(bytes: Bytes): RangeRecord {
    const data = JSON.parse(bytes.intoString())
    return new RangeRecord(
      BigNumber.fromString(data.start),
      BigNumber.fromString(data.end),
      Bytes.fromHexString(data.value)
    )
  }
  public start: BigNumber
  public end: BigNumber
  public value: Bytes
  constructor(
    start: number | bigint | BigNumber,
    end: number | bigint | BigNumber,
    value: Bytes
  ) {
    this.start = BigNumber.from(start)
    this.end = BigNumber.from(end)
    this.value = value
  }

  public encode(): Bytes {
    return Bytes.fromString(
      JSON.stringify({
        start: this.start.data.toString(),
        end: this.end.data.toString(),
        value: this.value.toHexString()
      })
    )
  }
  public intersect(start: bigint, end: bigint): boolean {
    if (end <= start) {
      throw new Error('end must be greater than start.')
    }
    if (start < 0) {
      throw new Error('start must not be negative value.')
    }
    const maxStart = BigIntMath.max(this.start.data, start)
    const maxEnd = BigIntMath.min(this.end.data, end)
    return maxStart < maxEnd
  }
}

export interface RangeIterator {
  next(): Promise<RangeRecord | null>
}

export interface RangeStore {
  get(start: bigint, end: bigint): Promise<RangeRecord[]>
  put(start: bigint, end: bigint, value: Bytes): Promise<void>
  del(start: bigint, end: bigint): Promise<void>
  bucket(key: Bytes): Promise<RangeStore>
  iter(lowerBound: bigint): RangeIterator
}
