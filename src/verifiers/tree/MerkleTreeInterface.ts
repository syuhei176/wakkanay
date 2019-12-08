import { Bytes } from '../../types'

export interface MerkleTreeNode<T> {
  readonly data: Bytes
  getInterval(): T
  encode(): Bytes
}

export interface MerkleTreeGenerator<I, T extends MerkleTreeNode<I>> {
  generate(leaves: T[]): MerkleTreeInterface<I, T>
}

export interface MerkleTreeInterface<I, T extends MerkleTreeNode<I>> {
  getRoot(): Bytes
  findIndex(leaf: Bytes): number | null
  getLeaf(index: number): T
}

export interface MerkleTreeVerifier<B, T extends MerkleTreeNode<I>, I> {
  verifyInclusion(leaf: T, interval: B, root: Bytes, inclusionProof: I): boolean
}

export class InclusionProof<I, T extends MerkleTreeNode<I>> {
  constructor(
    readonly leafIndex: I,
    readonly leafPosition: number,
    readonly siblings: T[]
  ) {}
}
