import { Bytes, Address, BigNumber, Range } from '../../types'
import {
  MerkleTreeInterface,
  MerkleTreeGenerator,
  MerkleTreeNode,
  MerkleTreeVerifier,
  InclusionProof
} from './MerkleTreeInterface'
import {
  AddressTree,
  AddressTreeNode,
  AddressTreeVerifier,
  AddressTreeInclusionProof
} from './AddressTree'
import {
  IntervalTree,
  IntervalTreeNode,
  IntervalTreeVerifier
} from './IntervalTree'

export interface DoubleLayerInclusionProof {
  intervalInclusionProof: InclusionProof<BigNumber, IntervalTreeNode>
  addressInclusionProof: AddressTreeInclusionProof
}

export interface DoubleLayerInterval {
  address: Address
  start: BigNumber
}

export class DoubleLayerTreeLeaf
  implements MerkleTreeNode<DoubleLayerInterval> {
  constructor(
    public address: Address,
    public start: BigNumber,
    public data: Bytes
  ) {}
  encode(): Bytes {
    return Bytes.concat([this.data, Bytes.fromHexString(this.address.data)])
  }
  getData(): Bytes {
    return this.data
  }
  getInterval() {
    return {
      address: this.address,
      start: this.start
    }
  }
}

export class DoubleLayerTreeGenerator
  implements MerkleTreeGenerator<DoubleLayerInterval, DoubleLayerTreeLeaf> {
  generate(leaves: DoubleLayerTreeLeaf[]): DoubleLayerTree {
    if (leaves.length == 0) {
      throw new Error('leaves must not be empty.')
    }
    return new DoubleLayerTree(leaves)
  }
}

/**
 * DoubleLayerTree class
 *     This class construct double layer tree which has 2 layers.
 *     The 1st layer is address tree and 2nd layer is interval tree.
 *     Please see https://docs.plasma.group/projects/spec/en/latest/src/01-core/double-layer-tree.html
 */
export class DoubleLayerTree
  implements MerkleTreeInterface<DoubleLayerInterval, DoubleLayerTreeLeaf> {
  addressTree: AddressTree
  intervalTreeMap: Map<string, IntervalTree> = new Map<string, IntervalTree>()
  constructor(private leaves: DoubleLayerTreeLeaf[]) {
    const addressTreeLeaves: AddressTreeNode[] = []
    const addressLeavesMap = leaves.reduce<Map<string, IntervalTreeNode[]>>(
      (newMap, l) => {
        let map = newMap.get(l.address.data)
        if (!map) {
          map = []
        }
        map.push(new IntervalTreeNode(l.start, l.data))
        newMap.set(l.address.data, map)
        return newMap
      },
      new Map<string, IntervalTreeNode[]>()
    )
    for (const [key, value] of addressLeavesMap.entries()) {
      const intervalTree = new IntervalTree(value)
      this.intervalTreeMap.set(key, intervalTree)
      addressTreeLeaves.push(
        new AddressTreeNode(Address.from(key), intervalTree.getRoot())
      )
    }
    this.addressTree = new AddressTree(addressTreeLeaves)
  }
  getRoot(): Bytes {
    return this.addressTree.getRoot()
  }
  findIndex(leaf: Bytes): number | null {
    const foundIndex = this.leaves.findIndex(
      l => l.getData().toHexString() == leaf.toHexString()
    )
    return foundIndex >= 0 ? foundIndex : null
  }
  getLeaf(index: number): DoubleLayerTreeLeaf {
    throw new Error('not implemented')
  }
  getLeaves(address: Address, start: bigint, end: bigint): number[] {
    const tree = this.intervalTreeMap.get(address.data)
    if (tree) {
      return tree.getLeaves(start, end)
    }
    throw new Error('address not found in address tree')
  }
  getInclusionProofByAddressAndIndex(
    address: Address,
    index: number
  ): DoubleLayerInclusionProof {
    const addressTreeIndex = this.addressTree.getIndexByAddress(address)
    if (addressTreeIndex !== null) {
      const addressInclusionProof = this.addressTree.getInclusionProof(
        addressTreeIndex
      )
      const intervalTree = this.intervalTreeMap.get(address.data)
      if (intervalTree) {
        const intervalInclusionProof = intervalTree.getInclusionProof(index)
        return {
          intervalInclusionProof,
          addressInclusionProof
        }
      }
    }
    throw new Error('address not found in address tree')
  }
}

export interface DoubleLayerTreeVerifier {
  verifyInclusion(
    leaf: DoubleLayerTreeLeaf,
    range: Range,
    root: Bytes,
    inclusionProof: DoubleLayerInclusionProof
  ): boolean
}

/**
 * DoubleLayerTreeVerifier is the class to verify inclusion of Double Layer Tree.
 */
export class DoubleLayerTreeVerifier implements DoubleLayerTreeVerifier {
  /**
   * verifyInclusion verify leaf data is included or not in specific range.
   * @param leaf The leaf to verify
   * @param range The range to verify it within implicit range
   * @param root The merkle root of tree
   * @param inclusionProof proof data to verify inclusion
   */
  verifyInclusion(
    leaf: DoubleLayerTreeLeaf,
    range: Range,
    root: Bytes,
    inclusionProof: DoubleLayerInclusionProof
  ): boolean {
    const intervalTreeVerifier = new IntervalTreeVerifier()
    const addressTreeVerifier = new AddressTreeVerifier()
    const intervalNode = new IntervalTreeNode(leaf.start, leaf.data)

    const merklePath = intervalTreeVerifier.calculateMerklePath(
      inclusionProof.intervalInclusionProof
    )
    const computeIntervalRootAndEnd = intervalTreeVerifier.computeRootFromInclusionProof(
      intervalNode,
      merklePath,
      inclusionProof.intervalInclusionProof.siblings
    )
    if (
      computeIntervalRootAndEnd.implicitEnd.data < range.end.data ||
      range.start.data < leaf.start.data
    ) {
      throw new Error('required range must not exceed the implicit range')
    }
    return addressTreeVerifier.verifyInclusion(
      new AddressTreeNode(leaf.address, computeIntervalRootAndEnd.root),
      leaf.address,
      leaf.address,
      root,
      inclusionProof.addressInclusionProof
    )
  }
}
