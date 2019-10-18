export type Address = string
export type Bytes = string
export interface Decision {
  outcome: boolean
}

export interface Property {
  deciderAddress: Address
  inputs: Bytes[]
}
