import { Bytes, Address, Range } from '@cryptoeconomicslab/primitives'
import { StateUpdate } from './'
import { Property } from '@cryptoeconomicslab/ovm'

/**
 * @name IExit
 * @description Interface of Exit. You can finalize exit with finalizeExit method.
 */
export default interface IExit {
  readonly stateUpdate: StateUpdate
  readonly id: Bytes
  readonly range: Range
  readonly property: Property
}
