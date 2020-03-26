import {
  Integer,
  Bytes,
  Struct,
  Codable,
  List,
  FixedBytes
} from '@cryptoeconomicslab/primitives'

export interface MerkleTreeNode<T> {
  readonly data: FixedBytes
  getInterval(): T
  encode(): Bytes
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

  public toStruct(): Struct {
    return new Struct([
      { key: 'leafIndex', value: this.leafIndex },
      { key: 'leafPosition', value: Integer.from(this.leafPosition) },
      {
        key: 'siblings',
        value: List.from(
          Bytes,
          this.siblings.map(s => s.encode())
        )
      }
    ])
  }
}
