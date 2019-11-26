import { Bytes, BigNumber } from '../../types'
import {
  AbstractMerkleTree,
  AbstractMerkleVerifier
} from './AbstractMerkleTree'
import { InclusionProof, MerkleTreeNode } from './MerkleTreeInterface'
import { BigIntMath } from '../../utils'

export class IntervalTreeInclusionProof
  implements InclusionProof<IntervalTreeNode> {
  constructor(
    public leafPosition: number,
    public siblings: IntervalTreeNode[]
  ) {}
}

export class IntervalTreeNode implements MerkleTreeNode {
  /**
   *
   * @param start is 32 byte integer and lower bound of range.
   * @param data is hash of leaf data.
   */
  constructor(public start: BigNumber, public data: Bytes) {
    if (data.data.length !== 32) throw new Error('data length is not 32 bytes.')
  }
  encode(): Bytes {
    return Bytes.concat([
      this.data,
      Bytes.fromHexString(this.start.data.toString(16)).padZero(32)
    ])
  }
}

export class IntervalTree extends AbstractMerkleTree<
  IntervalTreeNode,
  IntervalTreeInclusionProof
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
  IntervalTreeNode,
  IntervalTreeInclusionProof
> {
  computeRootFromInclusionProof(
    leaf: IntervalTreeNode,
    merklePath: string,
    proofElement: IntervalTreeNode[]
  ): Bytes {
    const firstRightSiblingIndex = merklePath.indexOf('0')
    const firstRightSibling =
      firstRightSiblingIndex >= 0
        ? proofElement[firstRightSiblingIndex]
        : undefined

    let computed: IntervalTreeNode = leaf
    let left: IntervalTreeNode
    let right: IntervalTreeNode
    for (let i = 0; i < proofElement.length; i++) {
      const sibling = proofElement[i]

      if (merklePath[i] === '1') {
        left = sibling
        right = computed
      } else {
        left = computed
        right = sibling

        if (
          firstRightSibling &&
          right.start.data < firstRightSibling.start.data
        ) {
          throw new Error('Invalid InclusionProof, intersection detected.')
        }
      }
      // check left.index < right.index
      computed = this.computeParent(left, right)
    }
    /*
    const implicitEnd = firstRightSibling
      ? firstRightSibling.start
      : this.createEmptyNode().start
      */
    return computed.data
  }

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
