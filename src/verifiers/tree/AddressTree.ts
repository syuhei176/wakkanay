import { Bytes, Address, Integer } from '../../types'
import { AbstractMerkleTree } from './AbstractMerkleTree'
import { MerkleTreeNode } from './MerkleTreeInterface'

export class AddressTreeNode implements MerkleTreeNode {
  constructor(public address: Address, public data: Bytes) {}
  getData(): Bytes {
    return this.data
  }
}

export class AddressTree extends AbstractMerkleTree<AddressTreeNode> {
  constructor(leaves: AddressTreeNode[]) {
    super(leaves)
  }
  computeParent(a: AddressTreeNode, b: AddressTreeNode): AddressTreeNode {
    return new AddressTreeNode(
      a.address,
      this.hashAlgorythm.hash(
        Bytes.concat(this.encodeNode(a), this.encodeNode(b))
      )
    )
  }
  private encodeNode(node: AddressTreeNode): Bytes {
    return Bytes.concat(node.data, Bytes.fromHexString(node.address.data))
  }
  createEmptyNode(): AddressTreeNode {
    return new AddressTreeNode(Address.default(), Bytes.default())
  }
  getInclusionProof(leaf: AddressTreeNode): Bytes {
    throw new Error('not implemented')
  }
  verifyInclusion(
    leaf: AddressTreeNode,
    root: Bytes,
    inclusionProof: Bytes
  ): boolean {
    throw new Error('not implemented')
  }
}
