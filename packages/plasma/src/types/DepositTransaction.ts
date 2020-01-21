import { Address } from '@cryptoeconomicslab/primitives'
import { Property } from '@cryptoeconomicslab/ovm'

export default class DepositTransaction {
  constructor(
    readonly depositContractAddress: Address,
    readonly stateUpdate: Property
  ) {}

  public toString(): string {
    return `DepostiTransaction {
      contractAddress: ${this.depositContractAddress.data},
      stateUpdate: ${this.stateUpdate.toStruct().toString()}
    }`
  }
}
