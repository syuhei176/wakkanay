export type Address = string
export type Bytes = string
export interface IDecision {
  outcome: boolean
}

export interface IProperty {
  deciderAddress: Address
  inputs: Bytes[]
}
