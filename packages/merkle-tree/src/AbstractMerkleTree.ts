import { Bytes, Codable } from '@cryptoeconomicslab/primitives'
import { Hash, Keccak256 } from '@cryptoeconomicslab/hash'
import { ArrayUtils } from '@cryptoeconomicslab/utils'
import {
  MerkleTreeInterface,
  MerkleTreeNode,
  InclusionProof
} from './MerkleTreeInterface'

export abstract class AbstractMerkleTree<
  B extends Codable,
  T extends MerkleTreeNode<B>
> implements MerkleTreeInterface<B, T> {
  levels: T[][] = []
  constructor(
    protected leaves: T[],
    public verifier: AbstractMerkleVerifier<B, T>
  ) {
    this.calculateRoot(leaves, 0)
  }
  private calculateRoot(leaves: T[], level: number) {
    this.levels[level] = leaves
    if (leaves.length <= 1) {
      return
    }
    const parents: T[] = []
    ArrayUtils.chunk(leaves, 2).forEach(c => {
      if (c.length == 1) {
        parents.push(
          this.verifier.computeParent(c[0], this.verifier.createEmptyNode())
        )
      } else {
        parents.push(this.verifier.computeParent(c[0], c[1]))
      }
    })
    this.calculateRoot(parents, level + 1)
  }
  getRoot(): Bytes {
    return this.levels[this.levels.length - 1][0].data
  }
  findIndex(leaf: Bytes): number | null {
    const index = this.leaves.findIndex(
      l => l.data.toHexString() == leaf.toHexString()
    )
    return index >= 0 ? index : null
  }
  getLeaf(index: number): T {
    return this.leaves[index]
  }
  getInclusionProof(index: number): InclusionProof<B, T> {
    if (!(index in this.levels[0])) {
      throw new Error(`${index} isn't in leaves.`)
    }

    const inclusionProofElement: T[] = []
    let parentIndex: number
    let siblingIndex = this.getSiblingIndex(index)
    for (let i = 0; i < this.levels.length - 1; i++) {
      const level = this.levels[i]
      const node = level[siblingIndex] || this.verifier.createEmptyNode()
      inclusionProofElement.push(node)
      // Calcurates parent index and its sibling index
      parentIndex = this.getParentIndex(siblingIndex)
      siblingIndex = this.getSiblingIndex(parentIndex)
    }
    return new InclusionProof(
      this.levels[0][index].getInterval(),
      index,
      inclusionProofElement
    )
  }
  /**
   * Calucurate sibling index
   * @param index
   * @returns sibling index of `index`
   *   p
   *  / \
   * i   sibling
   */
  private getSiblingIndex(index: number): number {
    return index + (index % 2 === 0 ? 1 : -1)
  }
  /**
   * Calucurates parent index
   * @param index
   * @returns parent index of `index`
   *  parent
   *  / \
   * i   s
   */
  private getParentIndex(index: number): number {
    return index === 0 ? 0 : Math.floor(index / 2)
  }
}

export abstract class AbstractMerkleVerifier<
  B extends Codable,
  T extends MerkleTreeNode<B>
> {
  constructor(protected hashAlgorythm: Hash = Keccak256) {}
  /**
   * verify inclusion of the leaf in certain range
   * @param leaf The leaf which is included in tree
   * @param intervalStart The start of range where the leaf is included in
   * @param intervalEnd The end of range where the leaf is included in
   * @param root Root hash of tree
   * @param inclusionProof Proof data to verify inclusion of the leaf
   */
  verifyInclusion(
    leaf: T,
    intervalStart: B,
    intervalEnd: B,
    root: Bytes,
    inclusionProof: InclusionProof<B, T>
  ): boolean {
    const merklePath = this.calculateMerklePath(inclusionProof)
    const computeIntervalRootAndEnd = this.computeRootFromInclusionProof(
      leaf,
      merklePath,
      inclusionProof.siblings
    )
    // computeIntervalRootAndEnd.implicitEnd < intervalEnd
    if (
      this.compare(computeIntervalRootAndEnd.implicitEnd, intervalEnd) == -1 ||
      this.compare(intervalStart, leaf.getInterval()) == -1
    ) {
      throw new Error('required range must not exceed the implicit range')
    }
    return computeIntervalRootAndEnd.root.equals(root)
  }

  computeRootFromInclusionProof(
    leaf: T,
    merklePath: string,
    proofElement: T[]
  ): { root: Bytes; implicitEnd: B } {
    const firstRightSiblingIndex = merklePath.indexOf('0')
    const firstRightSibling =
      firstRightSiblingIndex >= 0
        ? proofElement[firstRightSiblingIndex]
        : undefined

    let computed: T = leaf
    let left: T
    let right: T
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
          this.compare(right.getInterval(), firstRightSibling.getInterval()) ==
            -1
        ) {
          throw new Error('Invalid InclusionProof, intersection detected.')
        }
      }
      // check left.index < right.index
      computed = this.computeParent(left, right)
    }
    const implicitEnd = firstRightSibling
      ? firstRightSibling.getInterval()
      : this.createEmptyNode().getInterval()
    return { root: computed.data, implicitEnd }
  }

  calculateMerklePath(inclusionProof: InclusionProof<B, T>): string {
    return inclusionProof.leafPosition
      .toString(2)
      .padStart(inclusionProof.siblings.length, '0')
      .split('')
      .reverse()
      .join('')
  }
  abstract computeParent(a: T, b: T): T
  abstract createEmptyNode(): T
  /**
   *
   * @param a
   * @param b
   * @returns 0 if they are equal, 1 if a is higher than b, -1 if a is lower than b
   */
  abstract compare(a: B, b: B): number
}
