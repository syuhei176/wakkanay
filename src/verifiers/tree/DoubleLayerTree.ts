import { Bytes, Address, Integer } from '../../types'
import {
  MerkleTreeInterface,
  MerkleTreeGenerator,
  MerkleTreeNode
} from './MerkleTreeInterface'
import { AddressTree, AddressTreeNode } from './AddressTree'
import { IntervalTree, IntervalTreeNode } from './IntervalTree'

export class DoubleLayerTreeLeaf implements MerkleTreeNode {
  constructor(
    public address: Address,
    public start: Integer,
    public data: Bytes
  ) {}
  getData(): Bytes {
    return this.data
  }
}

export class DoubleLayerTreeGenerator
  implements MerkleTreeGenerator<DoubleLayerTreeLeaf> {
  generate(
    leaves: DoubleLayerTreeLeaf[]
  ): MerkleTreeInterface<DoubleLayerTreeLeaf> {
    if (leaves.length == 0) {
      throw new Error('leaves must not be empty.')
    }
    return new DoubleLayerTree(leaves)
  }
}

export class DoubleLayerTree
  implements MerkleTreeInterface<DoubleLayerTreeLeaf> {
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
  findLeaf(leaf: Bytes): DoubleLayerTreeLeaf | null {
    const foundLeaf = this.leaves.find(
      l => l.getData().toHexString() == leaf.toHexString()
    )
    return foundLeaf ? foundLeaf : null
  }
  getLeaf(index: number): DoubleLayerTreeLeaf {
    throw new Error('not implemented')
  }
  getLeaves(
    address: Address,
    start: number,
    end: number
  ): DoubleLayerTreeLeaf[] {
    throw new Error('not implemented')
  }
  getInclusionProof(leaf: DoubleLayerTreeLeaf): Bytes {
    throw new Error('not implemented')
  }
  verifyInclusion(
    leaf: DoubleLayerTreeLeaf,
    root: Bytes,
    inclusionProof: Bytes
  ): boolean {
    throw new Error('not implemented')
  }
}
