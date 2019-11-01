export type Address = string
export type Bytes = string
export interface Decision {
  outcome: boolean
}

export interface Property {
  deciderAddress: Address
  inputs: Bytes[]
}

export type ParamType = {
  name?: string
  type: string
  indexed?: boolean
  components?: Array<any>
}
