export type Address = String
export type Bytes = String
export interface Decision {
  outcome: boolean
}

class Property {
  public deciderAddress: Address
  public inputs: Bytes[]
  constructor(deciderAddress: Address, inputs: Bytes[]) {
    this.deciderAddress = deciderAddress
    this.inputs = inputs
  }
}
