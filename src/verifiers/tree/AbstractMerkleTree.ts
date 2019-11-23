import { Bytes, Address, Integer } from '../../types'
import { MerkleTreeInterface, MerkleTreeNode } from './MerkleTreeInterface'
import { ArrayUtils } from '../../utils'
import { Hash } from '../hash/Hash'
import { Keccak256 } from '../hash/Keccak256'

export class AbstractMerkleTree<T extends MerkleTreeNode>
  implements MerkleTreeInterface<T> {
  levels: T[][] = []
  constructor(
    protected leaves: T[],
    protected hashAlgorythm: Hash = Keccak256
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
        parents.push(this.computeParent(c[0], this.createEmptyNode()))
      } else {
        parents.push(this.computeParent(c[0], c[1]))
      }
    })
    this.calculateRoot(parents, level + 1)
  }
  computeParent(a: T, b: T): T {
    throw new Error('Method not implemented')
  }
  createEmptyNode(): T {
    throw new Error('Method not implemented')
  }
  getRoot(): Bytes {
    return this.levels[this.levels.length - 1][0].getData()
  }
  findLeaf(leaf: Bytes): T | null {
    const foundLeaf = this.leaves.find(
      l => l.getData().toHexString() == leaf.toHexString()
    )
    return foundLeaf ? foundLeaf : null
  }
  getLeaf(index: number): T {
    return this.leaves[index]
  }
  getInclusionProof(leaf: T): Bytes {
    throw new Error('not implemented')
  }
  verifyInclusion(leaf: T, root: Bytes, inclusionProof: Bytes): boolean {
    throw new Error('not implemented')
  }
}
