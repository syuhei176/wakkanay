import {
  Address,
  BigNumber,
  Bytes,
  Struct,
  Range
} from '@cryptoeconomicslab/primitives'
import { Property } from '@cryptoeconomicslab/ovm'

export default class Checkpoint {
  constructor(public subrange: Range, public stateUpdate: Property) {}

  public static default(): Checkpoint {
    return new Checkpoint(
      new Range(BigNumber.default(), BigNumber.default()),
      new Property(Address.default(), [])
    )
  }

  public static getParamType(): Struct {
    return new Struct([
      {
        key: 'subrange',
        value: Range.getParamType()
      },
      { key: 'stateUpdate', value: Property.getParamType() }
    ])
  }

  public static fromStruct(struct: Struct): Checkpoint {
    return new Checkpoint(
      Range.fromStruct(struct.data[0].value as Struct),
      Property.fromStruct(struct.data[1].value as Struct)
    )
  }

  public toStruct(): Struct {
    return new Struct([
      {
        key: 'subrange',
        value: this.subrange.toStruct()
      },
      { key: 'stateUpdate', value: this.stateUpdate.toStruct() }
    ])
  }

  // TODO: implement calculate checkpoint id
  public getId(): Bytes {
    return Bytes.default()
  }
}
