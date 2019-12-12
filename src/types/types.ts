import { Struct, BigNumber } from './Codables'

export type ParamType = {
  name?: string
  type: string
  indexed?: boolean
  components?: Array<any>
}

export class Range {
  constructor(readonly start: BigNumber, readonly end: BigNumber) {}
  public toStruct(): Struct {
    return new Struct({
      start: this.start,
      end: this.end
    })
  }
  public static fromStruct(_struct: Struct): Range {
    return new Range(
      _struct.data['start'] as BigNumber,
      _struct.data['end'] as BigNumber
    )
  }
  public static getParamType(): Struct {
    return Struct.from({
      start: BigNumber.default(),
      end: BigNumber.default()
    })
  }
}
