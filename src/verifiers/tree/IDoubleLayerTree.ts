import { Address, Bytes, Integer, Range } from '../../types'

export interface DoubleLayerTreeLeaf {
  address: Address
  end: Integer
  data: Bytes
}

export interface DoubleLayerTreeGenerator {
  generate(leaves: DoubleLayerTreeLeaf[]): IDoubleLayerTree
}

export interface IDoubleLayerTree {
  getRoot(): Bytes
  findLeaf(leaf: Bytes): DoubleLayerTreeLeaf
  getLeaf(address: Address, index: number): DoubleLayerTreeLeaf
  getLeaves(address: Address, range: Range): DoubleLayerTreeLeaf[]
  getInclusionProof(leaf: DoubleLayerTreeLeaf): Bytes
  verifyInclusion(
    leaf: DoubleLayerTreeLeaf,
    root: Bytes,
    inclusionProof: Bytes
  ): boolean
}

export interface DoubleLayerTreeVerifier {
  verifyInclusion(
    leaf: DoubleLayerTreeLeaf,
    root: Bytes,
    inclusionProof: Bytes
  ): boolean
}
