import { Bytes, Address } from '../../types'
import {
  AbstractMerkleTree,
  AbstractMerkleVerifier
} from './AbstractMerkleTree'
import { MerkleTreeNode } from './MerkleTreeInterface'

export class AddressTreeNode implements MerkleTreeNode {
  constructor(public address: Address, public data: Bytes) {
    if (data.data.length !== 32) throw new Error('data length is not 32 bytes.')
  }
  encode(): Bytes {
    return Bytes.concat([this.data, Bytes.fromHexString(this.address.data)])
  }
}

export class AddressTree extends AbstractMerkleTree<AddressTreeNode> {
  constructor(leaves: AddressTreeNode[]) {
    super(leaves, new AddressTreeVerifier())
  }
  getIndexByAddress(address: Address): number | null {
    const index = this.leaves.findIndex(l => l.address.data == address.data)
    return index >= 0 ? index : null
  }
}

export class AddressTreeVerifier extends AbstractMerkleVerifier<
  AddressTreeNode
> {
  computeRootFromInclusionProof(
    leaf: AddressTreeNode,
    merklePath: string,
    proofElement: AddressTreeNode[]
  ): Bytes {
    let computed: AddressTreeNode = leaf
    let left: AddressTreeNode
    let right: AddressTreeNode
    for (let i = 0; i < proofElement.length; i++) {
      const sibling = proofElement[i]

      if (merklePath[i] === '1') {
        left = sibling
        right = computed
      } else {
        left = computed
        right = sibling
      }
      computed = this.computeParent(left, right)
    }
    return computed.data
  }

  decodeProofElements(bytes: Bytes): AddressTreeNode[] {
    const buf = Buffer.from(bytes.data)
    const nodes: AddressTreeNode[] = []
    for (let i = 0; i < buf.length; i += 52) {
      nodes.push(
        new AddressTreeNode(
          Address.from(
            Bytes.from(
              Uint8Array.from(buf.subarray(i + 32, i + 52))
            ).toHexString()
          ),
          Bytes.from(Uint8Array.from(buf.subarray(i, i + 32)))
        )
      )
    }
    return nodes
  }

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
