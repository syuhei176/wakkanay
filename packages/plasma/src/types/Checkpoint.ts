import { Address, Bytes, Struct } from '@cryptoeconomicslab/primitives'
import { Property } from '@cryptoeconomicslab/ovm'

export default class Checkpoint {
  constructor(public stateUpdate: Property) {}

  public static default(): Checkpoint {
    return new Checkpoint(new Property(Address.default(), []))
  }

  public static getParamType(): Struct {
    return new Struct([{ key: 'stateUpdate', value: Property.getParamType() }])
  }

  public static fromStruct(struct: Struct): Checkpoint {
    return new Checkpoint(Property.fromStruct(struct.data[0].value as Struct))
  }

  public toStruct(): Struct {
    return new Struct([
      { key: 'stateUpdate', value: this.stateUpdate.toStruct() }
    ])
  }

  // TODO: implement calculate checkpoint id
  public getId(): Bytes {
    return Bytes.default()
  }
}
