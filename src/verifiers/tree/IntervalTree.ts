import { Bytes, BigNumber, Integer } from '../../types'
import {
  AbstractMerkleTree,
  AbstractMerkleVerifier
} from './AbstractMerkleTree'
import { MerkleTreeNode } from './MerkleTreeInterface'
import { BigIntMath } from '../../utils'

export class IntervalTreeNode implements MerkleTreeNode<BigNumber> {
  /**
   *
   * @param start is 32 byte integer and lower bound of range.
   * @param data is hash of leaf data.
   */
  constructor(public start: BigNumber, public data: Bytes) {
    if (data.data.length !== 32) throw new Error('data length is not 32 bytes.')
  }
  getInterval(): BigNumber {
    return this.start
  }
  encode(): Bytes {
    return Bytes.concat([
      this.data,
      Bytes.fromHexString(this.start.data.toString(16)).padZero(32)
    ])
  }
  compare(a: BigNumber, b: BigNumber): boolean {
    return a.data < b.data
  }
}

export class IntervalTree extends AbstractMerkleTree<
  BigNumber,
  IntervalTreeNode
> {
  constructor(leaves: IntervalTreeNode[]) {
    super(leaves, new IntervalTreeVerifier())
  }

  getLeaves(start: bigint, end: bigint): number[] {
    const results: number[] = []
    this.leaves.forEach((l, index) => {
      const targetStart = l.start
      const targetEnd = this.leaves[index + 1]
        ? this.leaves[index + 1].start.data
        : BigNumber.MAX_NUMBER.data
      const maxStart = BigIntMath.max(targetStart.data, start)
      const maxEnd = BigIntMath.min(targetEnd, end)
      if (maxStart < maxEnd) {
        results.push(index)
      }
    })
    return results
  }
}

export class IntervalTreeVerifier extends AbstractMerkleVerifier<
  BigNumber,
  IntervalTreeNode
> {
  computeParent(a: IntervalTreeNode, b: IntervalTreeNode): IntervalTreeNode {
    if (a.start.data > b.start.data) {
      throw new Error('left.start is not less than right.start.')
    }
    return new IntervalTreeNode(
      b.start,
      this.hashAlgorythm.hash(Bytes.concat([a.encode(), b.encode()]))
    )
  }

  createEmptyNode(): IntervalTreeNode {
    return new IntervalTreeNode(
      BigNumber.MAX_NUMBER,
      this.hashAlgorythm.hash(Bytes.default())
    )
  }
}
