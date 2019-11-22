import { Integer, Struct } from './Codables'

export type ParamType = {
  name?: string
  type: string
  indexed?: boolean
  components?: Array<any>
}

export class Range {
  constructor(private start: Integer, private end: Integer) {}
  public toStruct(): Struct {
    return new Struct({
      start: this.start,
      end: this.end
    })
  }
  public static fromStruct(_struct: Struct): Range {
    return new Range(
      _struct.data['start'] as Integer,
      _struct.data['end'] as Integer
    )
  }
}
