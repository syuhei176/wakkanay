import { Address, Bytes, List, Struct, Codable } from '../types/Codables'
import EthCoder from '../coder/EthCoder'

export interface Challenge {
  property: Property
  challengeInput: Bytes | null
}

export interface Decision {
  outcome: boolean
  challenges: Challenge[]
}

export class Property {
  public deciderAddress: Address
  public inputs: Bytes[]

  constructor(deciderAddress: Address, inputs: Bytes[]) {
    this.deciderAddress = deciderAddress
    this.inputs = inputs
  }
  public toStruct(): Struct {
    return new Struct({
      deciderAddress: this.deciderAddress,
      inputs: new List(Bytes, this.inputs)
    })
  }
  public static getParamType(): Struct {
    return Struct.from({
      deciderAddress: Address.default(),
      inputs: List.default(Bytes, Bytes.default())
    })
  }
  public static fromStruct(_struct: Struct): Property {
    return new Property(
      _struct.data['deciderAddress'] as Address,
      (_struct.data['inputs'] as List<Bytes>).data
    )
  }
}
