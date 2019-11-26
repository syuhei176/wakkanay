import { Bytes, Address, Integer } from '../../types'
import {
  AbstractMerkleTree,
  AbstractMerkleVerifier
} from './AbstractMerkleTree'
import { InclusionProof, MerkleTreeNode } from './MerkleTreeInterface'
import { BufferUtils } from '../../utils'

export class IntervalTreeInclusionProof
  implements InclusionProof<IntervalTreeNode> {
  constructor(
    public leafPosition: number,
    public siblings: IntervalTreeNode[]
  ) {}
}

export class IntervalTreeNode implements MerkleTreeNode {
  constructor(public start: Integer, public data: Bytes) {
    if (data.data.length !== 32) throw new Error('data length is not 32 bytes.')
  }
  encode(): Bytes {
    return Bytes.concat([
      this.data,
      Bytes.from(Uint8Array.from(BufferUtils.numberToBuffer(this.start.data)))
    ])
  }
}

const MAX_NUMBER = Math.pow(2, 32) - 1

export class IntervalTree extends AbstractMerkleTree<
  IntervalTreeNode,
  IntervalTreeInclusionProof
> {
  constructor(leaves: IntervalTreeNode[]) {
    super(leaves, new IntervalTreeVerifier())
  }
  getLeaves(start: number, end: number): number[] {
    const results: number[] = []
    this.leaves.forEach((l, index) => {
      const targetStart = l.start.data
      const targetEnd = this.leaves[index + 1]
        ? this.leaves[index + 1].start.data
        : MAX_NUMBER
      const maxStart = Math.max(targetStart, start)
      const maxEnd = Math.min(targetEnd, end)
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
      Integer.from(MAX_NUMBER),
      this.hashAlgorythm.hash(Bytes.default())
    )
  }
}
