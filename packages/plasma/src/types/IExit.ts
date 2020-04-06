import { Bytes, Address, Range } from '@cryptoeconomicslab/primitives'
import { StateUpdate } from './'
import { Property } from '@cryptoeconomicslab/ovm'

/**
 * Interface of Exit
 */
export default interface IExit {
  readonly stateUpdate: StateUpdate
  readonly id: Bytes
  readonly range: Range

  toProperty(exitPredicateAddress: Address): Property
}
