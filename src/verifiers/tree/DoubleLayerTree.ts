import { Bytes, Address, Integer, Struct } from '../../types'
import {
  InclusionProof,
  MerkleTreeInterface,
  MerkleTreeGenerator,
  MerkleTreeNode,
  MerkleTreeVerifier
} from './MerkleTreeInterface'
import {
  AddressTree,
  AddressTreeNode,
  AddressTreeVerifier
} from './AddressTree'
import {
  IntervalTree,
  IntervalTreeNode,
  IntervalTreeVerifier
} from './IntervalTree'
import { BufferUtils } from '../../utils'
import { AbstractMerkleTree } from './AbstractMerkleTree'

export class DoubleLayerTreeLeaf implements MerkleTreeNode {
  constructor(
    public address: Address,
    public start: Integer,
    public data: Bytes
  ) {}
  encode(): Bytes {
    return Bytes.concat([this.data, Bytes.fromHexString(this.address.data)])
  }
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
  findIndex(leaf: Bytes): number | null {
    const foundIndex = this.leaves.findIndex(
      l => l.getData().toHexString() == leaf.toHexString()
    )
    return foundIndex >= 0 ? foundIndex : null
  }
  getLeaf(index: number): DoubleLayerTreeLeaf {
    throw new Error('not implemented')
  }
  getLeaves(address: Address, start: number, end: number): number[] {
    throw new Error('not implemented')
  }
  getInclusionProofByAddressAndIndex(address: Address, index: number): Bytes {
    const addressTreeIndex = this.addressTree.getIndexByAddress(address)
    if (addressTreeIndex !== null) {
      const addressInclusionProof = this.addressTree.getInclusionProof(
        addressTreeIndex
      )
      const intervalTree = this.intervalTreeMap.get(address.data)
      if (intervalTree) {
        const intervalInclusionProof = intervalTree.getInclusionProof(index)
        const header = Bytes.fromBuffer(
          BufferUtils.numberToBuffer(intervalInclusionProof.data.length)
        )
        return Bytes.concat([
          header,
          intervalInclusionProof,
          addressInclusionProof
        ])
      }
    }
    throw new Error('address not found in address tree')
  }
}

export class DoubleLayerTreeVerifier
  implements MerkleTreeVerifier<DoubleLayerTreeLeaf> {
  verifyInclusion(
    leaf: DoubleLayerTreeLeaf,
    root: Bytes,
    inclusionProofBytes: Bytes
  ): boolean {
    const intervalTreeVerifier = new IntervalTreeVerifier()
    const addressTreeVerifier = new AddressTreeVerifier()
    const intervalNode = new IntervalTreeNode(leaf.start, leaf.data)

    const inclusionProofs = this.decodeInclusionProof(inclusionProofBytes)
    const {
      merklePath,
      proofElement
    } = intervalTreeVerifier.calculateMerklePath(inclusionProofs[0])
    const intervalRoot = intervalTreeVerifier.computeRootFromInclusionProof(
      intervalNode,
      merklePath,
      proofElement
    )
    return addressTreeVerifier.verifyInclusion(
      new AddressTreeNode(leaf.address, intervalRoot),
      root,
      inclusionProofs[1]
    )
  }
  /**
   * decodeInclusionProof
   * @param bytes inclusion proof of double layer tree
   * @return [interval tree inclusion proof, address tree inclusion proof]
   */
  private decodeInclusionProof(bytes: Bytes): [Bytes, Bytes] {
    const buf = Buffer.from(bytes.data)
    const header = BufferUtils.bufferToNumber(buf.subarray(0, 4))
    return [
      Bytes.fromBuffer(buf.subarray(4, 4 + header)),
      Bytes.fromBuffer(buf.subarray(4 + header))
    ]
  }
}
