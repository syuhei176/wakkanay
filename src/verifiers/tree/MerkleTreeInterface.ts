import { Address, Bytes, Struct } from '../../types'

export interface MerkleTreeNode {
  readonly data: Bytes
  encode(): Bytes
}

export interface InclusionProof<T extends MerkleTreeNode> {
  readonly leafPosition: number
  readonly siblings: T[]
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

export interface MerkleTreeVerifier<T extends MerkleTreeNode, I> {
  verifyInclusion(leaf: T, root: Bytes, inclusionProof: I): boolean
}
