import {
  Bytes,
  FixedBytes,
  Address,
  Integer,
  Struct,
  List
} from '@cryptoeconomicslab/primitives'
import {
  AbstractMerkleTree,
  AbstractMerkleVerifier
} from './AbstractMerkleTree'
import { MerkleTreeNode, InclusionProof } from './MerkleTreeInterface'

export class AddressTreeNode implements MerkleTreeNode<Address> {
  constructor(public address: Address, public data: FixedBytes) {
    if (data.size !== 32) throw new Error('data length is not 32 bytes.')
  }

  getInterval(): Address {
    return this.address
  }

  static decode(b: Bytes): AddressTreeNode {
    return AddressTreeNode.fromStruct(
      ovmContext.coder.decode(AddressTreeNode.getParamType(), b)
    )
  }

  encode(): Bytes {
    return ovmContext.coder.encode(this.toStruct())
  }

  public static getParamType(): Struct {
    return new Struct([
      { key: 'data', value: FixedBytes.default(32) },
      { key: 'address', value: Address.default() }
    ])
  }

  public static fromStruct(struct: Struct): AddressTreeNode {
    const data = struct.data[0].value as FixedBytes
    const address = struct.data[1].value as Address
    return new AddressTreeNode(address, data)
  }

  public toStruct(): Struct {
    return new Struct([
      {
        key: 'data',
        value: this.data
      },
      {
        key: 'address',
        value: this.address
      }
    ])
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
      FixedBytes.from(
        32,
        this.hashAlgorythm.hash(Bytes.concat(a.encode(), b.encode())).data
      )
    )
  }
  createEmptyNode(): AddressTreeNode {
    // TODO: empty node shouldn't be zero address?
    return new AddressTreeNode(Address.default(), FixedBytes.default(32))
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
