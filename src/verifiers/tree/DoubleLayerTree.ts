import { Bytes, Address, Range } from '../../types'
import { DoubleLayerTreeLeaf, IDoubleLayerTree } from './IDoubleLayerTree'

export class DoubleLayerTree implements IDoubleLayerTree {
  getRoot(): Bytes {
    throw new Error('not implemented')
  }
  findLeaf(leaf: Bytes): DoubleLayerTreeLeaf {
    throw new Error('not implemented')
  }
  getLeaf(address: Address, index: number): DoubleLayerTreeLeaf {
    throw new Error('not implemented')
  }
  getLeaves(address: Address, range: Range): DoubleLayerTreeLeaf[] {
    throw new Error('not implemented')
  }
  getInclusionProof(leaf: DoubleLayerTreeLeaf): Bytes {
    throw new Error('not implemented')
  }
  verifyInclusion(
    leaf: DoubleLayerTreeLeaf,
    root: Bytes,
    inclusionProof: Bytes
  ): boolean {
    throw new Error('not implemented')
  }
}
