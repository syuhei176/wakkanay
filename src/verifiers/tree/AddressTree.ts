import { Bytes, Address } from '../../types'
import {
  AbstractMerkleTree,
  AbstractMerkleVerifier
} from './AbstractMerkleTree'
import { MerkleTreeNode, InclusionProof } from './MerkleTreeInterface'

export class AddressTreeNode implements MerkleTreeNode<Address> {
  constructor(public address: Address, public data: Bytes) {
    if (data.data.length !== 32) throw new Error('data length is not 32 bytes.')
  }
  encode(): Bytes {
    return Bytes.concat([this.data, Bytes.fromHexString(this.address.data)])
  }
  getInterval(): Address {
    return this.address
  }
  compare(a: Address, b: Address): boolean {
    return a.data < b.data
  }
}

export type AddressTreeInclusionProof = InclusionProof<Address, AddressTreeNode>

export class AddressTree extends AbstractMerkleTree<Address, AddressTreeNode> {
  constructor(leaves: AddressTreeNode[]) {
    super(leaves, new AddressTreeVerifier())
  }
  getIndexByAddress(address: Address): number | null {
    const index = this.leaves.findIndex(l => l.address.data == address.data)
    return index >= 0 ? index : null
  }
}

export class AddressTreeVerifier extends AbstractMerkleVerifier<
  Address,
  AddressTreeNode
> {
  computeParent(a: AddressTreeNode, b: AddressTreeNode): AddressTreeNode {
    return new AddressTreeNode(
      a.address,
      this.hashAlgorythm.hash(Bytes.concat(a.encode(), b.encode()))
    )
  }
  createEmptyNode(): AddressTreeNode {
    // TODO: empty node shouldn't be zero address?
    return new AddressTreeNode(Address.default(), Bytes.default())
  }
}
