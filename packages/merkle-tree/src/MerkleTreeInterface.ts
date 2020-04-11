import {
  Integer,
  Bytes,
  Struct,
  Codable,
  List,
  FixedBytes
} from '@cryptoeconomicslab/primitives'
import { CodableF } from '@cryptoeconomicslab/primitives/lib/Codable'

export interface MerkleTreeNode<T> {
  readonly data: FixedBytes
  getInterval(): T
  encode(): Bytes
  toStruct(): Struct
}

export interface MerkleTreeGenerator<I, T extends MerkleTreeNode<I>> {
  generate(leaves: T[]): MerkleTreeInterface<I, T>
}

export interface MerkleTreeInterface<I, T extends MerkleTreeNode<I>> {
  getRoot(): FixedBytes
  findIndex(leaf: FixedBytes): number | null
  getLeaf(index: number): T
}

export interface MerkleTreeVerifier<B, T extends MerkleTreeNode<I>, I> {
  verifyInclusion(
    leaf: T,
    interval: B,
    root: FixedBytes,
    inclusionProof: I
  ): boolean
}

export class InclusionProof<I extends Codable, T extends MerkleTreeNode<I>> {
  constructor(
    readonly leafIndex: I,
    readonly leafPosition: number,
    readonly siblings: T[]
  ) {}
}
