import { BigNumber, Bytes } from '@cryptoeconomicslab/primitives'
import { BigIntMath } from '@cryptoeconomicslab/utils'
import JSBI from 'jsbi'

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
    start: number | JSBI | BigNumber,
    end: number | JSBI | BigNumber,
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
  public intersect(start: JSBI, end: JSBI): boolean {
    if (JSBI.lessThanOrEqual(end, start)) {
      throw new Error('end must be greater than start.')
    }
    if (JSBI.lessThan(start, JSBI.BigInt(0))) {
      throw new Error('start must not be negative value.')
    }
    const maxStart = BigIntMath.max(this.start.data, start)
    const minEnd = BigIntMath.min(this.end.data, end)
    return JSBI.lessThan(maxStart, minEnd)
  }
}

export interface RangeIterator {
  next(): Promise<RangeRecord | null>
}

export interface RangeStore {
  get(start: JSBI, end: JSBI): Promise<RangeRecord[]>
  put(start: JSBI, end: JSBI, value: Bytes): Promise<void>
  del(start: JSBI, end: JSBI): Promise<void>
  bucket(key: Bytes): Promise<RangeStore>
  iter(lowerBound: JSBI): RangeIterator
}
