import { Bytes, Address, Integer } from '../../types'
import {
  MerkleTreeInterface,
  MerkleTreeNode,
  InclusionProof,
  MerkleTreeVerifier
} from './MerkleTreeInterface'
import { ArrayUtils, BufferUtils } from '../../utils'
import { Hash } from '../hash/Hash'
import { Keccak256 } from '../hash/Keccak256'

export abstract class AbstractMerkleTree<T extends MerkleTreeNode>
  implements MerkleTreeInterface<T> {
  levels: T[][] = []
  constructor(
    protected leaves: T[],
    public verifier: AbstractMerkleVerifier<T>
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
  getInclusionProof(index: number): Bytes {
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
    const siblings = Bytes.concat(inclusionProofElement.map(p => p.encode()))
    return AbstractMerkleTree.encodeInclusionProof({
      siblings,
      leafPosition: index
    })
  }
  static encodeInclusionProof(inclusionProof: InclusionProof): Bytes {
    return Bytes.concat(
      Bytes.fromBuffer(BufferUtils.numberToBuffer(inclusionProof.leafPosition)),
      inclusionProof.siblings
    )
  }
  static decodeInclusionProof(inclusionProof: Bytes): InclusionProof {
    const buf = Buffer.from(inclusionProof.data)
    return {
      siblings: Bytes.fromBuffer(buf.subarray(4)),
      leafPosition: BufferUtils.bufferToNumber(buf.subarray(0, 4))
    }
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

export abstract class AbstractMerkleVerifier<T extends MerkleTreeNode>
  implements MerkleTreeVerifier<T> {
  constructor(protected hashAlgorythm: Hash = Keccak256) {}
  abstract decodeProofElements(bytes: Bytes): T[]
  verifyInclusion(leaf: T, root: Bytes, inclusionProofBytes: Bytes): boolean {
    const { merklePath, proofElement } = this.calculateMerklePath(
      inclusionProofBytes
    )
    const computeRoot = this.computeRootFromInclusionProof(
      leaf,
      merklePath,
      proofElement
    )
    return computeRoot.equals(root)
  }

  calculateMerklePath(
    inclusionProofBytes: Bytes
  ): { merklePath: string; proofElement: T[] } {
    const inclusionProof = AbstractMerkleTree.decodeInclusionProof(
      inclusionProofBytes
    )
    const proofElement = this.decodeProofElements(inclusionProof.siblings)
    const merklePath = inclusionProof.leafPosition
      .toString(2)
      .padStart(proofElement.length, '0')
      .split('')
      .reverse()
      .join('')
    return {
      merklePath,
      proofElement
    }
  }
  abstract computeRootFromInclusionProof(
    leaf: T,
    merklePath: string,
    proofElement: T[]
  ): Bytes
  abstract computeParent(a: T, b: T): T
  abstract createEmptyNode(): T
}
