import { Address, Bytes } from '../types'

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
  public encode(): Bytes {
    return JSON.stringify([this.deciderAddress, this.inputs])
  }
  public static decode(bytes: Bytes): Property {
    const decoded = JSON.parse(bytes)
    return new Property(decoded[0], decoded[1])
  }
}
