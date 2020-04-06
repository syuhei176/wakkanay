import StateUpdate from './StateUpdate'
import { DoubleLayerInclusionProof } from '@cryptoeconomicslab/merkle-tree'
import { Bytes, Address, Range } from '@cryptoeconomicslab/primitives'
import { Property } from '@cryptoeconomicslab/ovm'
import { decodeStructable } from '@cryptoeconomicslab/coder'
import { Keccak256 } from '@cryptoeconomicslab/hash'
import IExit from './IExit'

export default class ExitDeposit implements IExit {
  constructor(readonly stateUpdate: StateUpdate, readonly id: Bytes) {}

  public toProperty(exitPredicateAddress: Address): Property {
    const { encode } = ovmContext.coder
    return new Property(exitPredicateAddress, [
      encode(this.stateUpdate.property.toStruct())
    ])
  }

  public static fromProperty(property: Property): ExitDeposit {
    const { coder } = ovmContext
    const stateUpdate = StateUpdate.fromProperty(
      decodeStructable(Property, coder, property.inputs[0])
    )
    const id = Keccak256.hash(coder.encode(property.toStruct()))
    return new ExitDeposit(stateUpdate, id)
  }

  public get range(): Range {
    return this.stateUpdate.range
  }
}
