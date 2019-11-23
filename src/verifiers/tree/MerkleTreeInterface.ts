import { Address, Bytes } from '../../types'

export interface MerkleTreeNode {
  getData(): Bytes
}

export interface MerkleTreeGenerator<T extends MerkleTreeNode> {
  generate(leaves: T[]): MerkleTreeInterface<T>
}

export interface MerkleTreeInterface<T extends MerkleTreeNode> {
  getRoot(): Bytes
  findLeaf(leaf: Bytes): T | null
  getLeaf(index: number): T
  getInclusionProof(leaf: T): Bytes
  verifyInclusion(leaf: T, root: Bytes, inclusionProof: Bytes): boolean
}

export interface MerkleTreeVerifier<T extends MerkleTreeNode> {
  verifyInclusion(leaf: T, root: Bytes, inclusionProof: Bytes): boolean
}
