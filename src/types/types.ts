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
    return new Struct([
      {
        key: 'start',
        value: this.start
      },
      { key: 'end', value: this.end }
    ])
  }
  public static fromStruct(_struct: Struct): Range {
    return new Range(
      _struct.data[0].value as BigNumber,
      _struct.data[1].value as BigNumber
    )
  }
  public static getParamType(): Struct {
    return Struct.from([
      {
        key: 'start',
        value: BigNumber.default()
      },
      { key: 'end', value: BigNumber.default() }
    ])
  }
}
