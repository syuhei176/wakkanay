import { BigNumber, Bytes } from '@cryptoeconomicslab/primitives'
import { DoubleLayerInclusionProof } from '@cryptoeconomicslab/merkle-tree'

import Transaction from './Transaction'
import StateUpdate from './StateUpdate'

export interface CheckpointElement {
  blockNumber: BigNumber
  checkpointId: Bytes
}

export interface StateUpdateElement {
  blockNumber: BigNumber
  transactions: Transaction[]
  inclusionProof: DoubleLayerInclusionProof
}

export interface NonInclusionElement {
  blockNumber: BigNumber
  stateUpdate: StateUpdate
  inclusionProof: DoubleLayerInclusionProof
}

export type HistoryProof = Array<
  CheckpointElement | StateUpdateElement | NonInclusionElement
>
