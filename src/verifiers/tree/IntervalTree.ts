import { Bytes, Address, Integer } from '../../types'
import { AbstractMerkleTree } from './AbstractMerkleTree'
import { MerkleTreeNode } from './MerkleTreeInterface'

export class IntervalTreeNode implements MerkleTreeNode {
  constructor(public start: Integer, public data: Bytes) {}
  getData(): Bytes {
    return this.data
  }
}

export class IntervalTree extends AbstractMerkleTree<IntervalTreeNode> {
  constructor(leaves: IntervalTreeNode[]) {
    super(leaves)
  }
  computeParent(a: IntervalTreeNode, b: IntervalTreeNode): IntervalTreeNode {
    return new IntervalTreeNode(
      b.start,
      this.hashAlgorythm.hash(
        Bytes.concat(this.encodeNode(a), this.encodeNode(b))
      )
    )
  }
  private encodeNode(node: IntervalTreeNode): Bytes {
    return Bytes.concat(
      node.data,
      Bytes.from(Uint8Array.from(this.bigintToBuffer(node.start.data)))
    )
  }
  createEmptyNode(): IntervalTreeNode {
    return new IntervalTreeNode(Integer.from(1000), Bytes.default())
  }
  private bigintToBuffer(start: number): Buffer {
    const b = Buffer.alloc(4)
    b.writeUInt32LE(start, 0)
    return b
  }
  getLeaves(start: number, end: number): IntervalTreeNode[] {
    throw new Error('Method not implemented')
  }
  getInclusionProof(leaf: IntervalTreeNode): Bytes {
    throw new Error('not implemented')
  }
  verifyInclusion(
    leaf: IntervalTreeNode,
    root: Bytes,
    inclusionProof: Bytes
  ): boolean {
    throw new Error('not implemented')
  }
}
