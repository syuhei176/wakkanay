import { Address, Bytes, Struct } from '../../types'

export interface MerkleTreeNode {
  readonly data: Bytes
  encode(): Bytes
}

export interface InclusionProof {
  siblings: Bytes
  leafPosition: number
}

export interface MerkleTreeGenerator<T extends MerkleTreeNode> {
  generate(leaves: T[]): MerkleTreeInterface<T>
}

export interface MerkleTreeInterface<T extends MerkleTreeNode> {
  getRoot(): Bytes
  findIndex(leaf: Bytes): number | null
  getLeaf(index: number): T
  //  getInclusionProof(index: number): Bytes
}

export interface MerkleTreeVerifier<T extends MerkleTreeNode> {
  verifyInclusion(leaf: T, root: Bytes, inclusionProof: Bytes): boolean
}
