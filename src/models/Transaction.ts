import { Property } from '../types'

export class Transaction {
  public stateObject: Property
  constructor(stateObject: Property) {
    this.stateObject = stateObject
  }
  static decode(bytes: string) {
    return new Transaction({
      deciderAddress: '',
      inputs: []
    })
  }
}
