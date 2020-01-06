import { Bytes, Address, Integer, Struct, List } from '../../types'
import {
  AbstractMerkleTree,
  AbstractMerkleVerifier
} from './AbstractMerkleTree'
import { MerkleTreeNode, InclusionProof } from './MerkleTreeInterface'

export class AddressTreeNode implements MerkleTreeNode<Address> {
  constructor(public address: Address, public data: Bytes) {
    if (data.data.length !== 32) throw new Error('data length is not 32 bytes.')
  }
  static decode(b: Bytes): AddressTreeNode {
    const d = b.split(32)
    return new AddressTreeNode(Address.from(d[1].toHexString()), d[0])
  }
  encode(): Bytes {
    return Bytes.concat([this.data, Bytes.fromHexString(this.address.data)])
  }
  getInterval(): Address {
    return this.address
  }
}

export class AddressTreeInclusionProof extends InclusionProof<
  Address,
  AddressTreeNode
> {
  public static getParamType(): Struct {
    return new Struct([
      { key: 'leafIndex', value: Address.default() },
      { key: 'leafPosition', value: Integer.default() },
      {
        key: 'siblings',
        value: List.default(Bytes, Bytes.default())
      }
    ])
  }

  public static fromStruct(struct: Struct): AddressTreeInclusionProof {
    const leafIndex = struct.data[0].value as Address
    const leafPosition = struct.data[1].value as Integer
    const siblings = struct.data[2].value as List<Bytes>

    return new AddressTreeInclusionProof(
      leafIndex,
      leafPosition.data,
      siblings.data.map(AddressTreeNode.decode)
    )
  }
}

export class AddressTree extends AbstractMerkleTree<Address, AddressTreeNode> {
  constructor(leaves: AddressTreeNode[]) {
    super(leaves, new AddressTreeVerifier())
  }
  getIndexByAddress(address: Address): number | null {
    const index = this.leaves.findIndex(l => l.address.data == address.data)
    return index >= 0 ? index : null
  }
  getInclusionProof(index: number): AddressTreeInclusionProof {
    const inclusionProof = super.getInclusionProof(index)
    return new AddressTreeInclusionProof(
      inclusionProof.leafIndex,
      inclusionProof.leafPosition,
      inclusionProof.siblings
    )
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
  /**
   * compare Address
   */
  compare(a: Address, b: Address): number {
    if (a.data > b.data) return 1
    else if (a.data == b.data) return 0
    else return -1
  }
}
