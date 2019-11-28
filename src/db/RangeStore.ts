import { BigNumber, Bytes, Struct } from '../types/Codables'
import JsonCoder from '../coder/JsonCoder'
import { BigIntMath } from '../utils'

export class RangeRecord {
  public static decode(bytes: Bytes): RangeRecord {
    return RangeRecord.fromStruct(
      JsonCoder.decode(RangeRecord.getParamType(), bytes)
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
  public toStruct(): Struct {
    return new Struct({
      start: this.start,
      end: this.end,
      value: this.value
    })
  }
  public static fromStruct(_struct: Struct): RangeRecord {
    return new RangeRecord(
      _struct.data['start'] as BigNumber,
      _struct.data['end'] as BigNumber,
      _struct.data['value'] as Bytes
    )
  }
  public static getParamType(): Struct {
    return Struct.from({
      start: BigNumber.default(),
      end: BigNumber.default(),
      value: Bytes.default()
    })
  }
  public encode(): Bytes {
    return JsonCoder.encode(this.toStruct())
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

export interface RangeStore {
  get(start: bigint, end: bigint): Promise<RangeRecord[]>
  put(start: bigint, end: bigint, value: Bytes): Promise<void>
  del(start: bigint, end: bigint): Promise<void>
  bucket(key: Bytes): Promise<RangeStore>
}
