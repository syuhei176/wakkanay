import StateUpdate from './StateUpdate'
import { DoubleLayerInclusionProof } from '@cryptoeconomicslab/merkle-tree'
import { Bytes, Address, Range } from '@cryptoeconomicslab/primitives'
import { Property } from '@cryptoeconomicslab/ovm'
import { decodeStructable } from '@cryptoeconomicslab/coder'
import { Keccak256 } from '@cryptoeconomicslab/hash'

export default class Exit {
  constructor(
    readonly stateUpdate: StateUpdate,
    readonly inclusionProof: DoubleLayerInclusionProof,
    readonly id: Bytes
  ) {}

  public toProperty(exitPredicateAddress: Address): Property {
    const { encode } = ovmContext.coder
    return new Property(exitPredicateAddress, [
      encode(this.stateUpdate.property.toStruct()),
      encode(this.inclusionProof.toStruct())
    ])
  }

  public static fromProperty(property: Property): Exit {
    const { coder } = ovmContext
    const stateUpdate = StateUpdate.fromProperty(
      decodeStructable(Property, coder, property.inputs[0])
    )
    const inclusionProof = decodeStructable(
      DoubleLayerInclusionProof,
      coder,
      property.inputs[1]
    )
    const id = Keccak256.hash(coder.encode(property.toStruct()))
    return new Exit(stateUpdate, inclusionProof, id)
  }

  public get range(): Range {
    return this.stateUpdate.range
  }
}
