import {
  FixedBytes,
  Bytes,
  BigNumber,
  Integer,
  List,
  Struct
} from '@cryptoeconomicslab/primitives'
import { BigIntMath } from '@cryptoeconomicslab/utils'
import {
  AbstractMerkleTree,
  AbstractMerkleVerifier
} from './AbstractMerkleTree'
import { MerkleTreeNode, InclusionProof } from './MerkleTreeInterface'
import JSBI from 'jsbi'

export class IntervalTreeNode implements MerkleTreeNode<BigNumber> {
  /**
   *
   * @param start is 32 byte integer and lower bound of range.
   * @param data is hash of leaf data.
   */
  constructor(public start: BigNumber, public data: FixedBytes) {
    if (data.size !== 32) throw new Error('data length is not 32 bytes.')
  }
  getInterval(): BigNumber {
    return this.start
  }
  static decode(b: Bytes): IntervalTreeNode {
    return IntervalTreeNode.fromStruct(
      ovmContext.coder.decode(IntervalTreeNode.getParamType(), b)
    )
  }

  encode(): Bytes {
    return ovmContext.coder.encode(this.toStruct())
  }

  public static getParamType(): Struct {
    return new Struct([
      { key: 'data', value: FixedBytes.default(32) },
      { key: 'start', value: BigNumber.default() }
    ])
  }

  public static fromStruct(struct: Struct): IntervalTreeNode {
    const data = struct.data[0].value as FixedBytes
    const start = struct.data[1].value as BigNumber
    return new IntervalTreeNode(start, data)
  }
  public toStruct(): Struct {
    return new Struct([
      {
        key: 'data',
        value: this.data
      },
      {
        key: 'start',
        value: this.start
      }
    ])
  }
}

export class IntervalTreeInclusionProof extends InclusionProof<
  BigNumber,
  IntervalTreeNode
> {
  public static getParamType(): Struct {
    return new Struct([
      { key: 'leafIndex', value: BigNumber.default() },
      { key: 'leafPosition', value: Integer.default() },
      {
        key: 'siblings',
        value: List.default(
          { default: () => IntervalTreeNode.getParamType() },
          IntervalTreeNode.getParamType()
        )
      }
    ])
  }

  public static fromStruct(struct: Struct): IntervalTreeInclusionProof {
    const leafIndex = struct.data[0].value as BigNumber
    const leafPosition = struct.data[1].value as Integer
    const siblings = struct.data[2].value as List<Struct>

    return new IntervalTreeInclusionProof(
      leafIndex,
      leafPosition.data,
      siblings.data.map(IntervalTreeNode.fromStruct)
    )
  }

  public toStruct(): Struct {
    return new Struct([
      { key: 'leafIndex', value: this.leafIndex },
      { key: 'leafPosition', value: Integer.from(this.leafPosition) },
      {
        key: 'siblings',
        value: List.from(
          { default: () => IntervalTreeNode.getParamType() },
          this.siblings.map(s => s.toStruct())
        )
      }
    ])
  }
}

export class IntervalTree extends AbstractMerkleTree<
  BigNumber,
  IntervalTreeNode
> {
  constructor(leaves: IntervalTreeNode[]) {
    super(leaves, new IntervalTreeVerifier())
  }

  getLeaves(start: JSBI, end: JSBI): number[] {
    const results: number[] = []
    this.leaves.forEach((l, index) => {
      const targetStart = l.start
      const targetEnd = this.leaves[index + 1]
        ? this.leaves[index + 1].start.data
        : BigNumber.MAX_NUMBER.data
      const maxStart = BigIntMath.max(targetStart.data, start)
      const maxEnd = BigIntMath.min(targetEnd, end)
      if (JSBI.lessThan(maxStart, maxEnd)) {
        results.push(index)
      }
    })
    return results
  }

  getInclusionProof(index: number): IntervalTreeInclusionProof {
    const inclusionProof = super.getInclusionProof(index)
    return new IntervalTreeInclusionProof(
      inclusionProof.leafIndex,
      inclusionProof.leafPosition,
      inclusionProof.siblings
    )
  }
}

export class IntervalTreeVerifier extends AbstractMerkleVerifier<
  BigNumber,
  IntervalTreeNode
> {
  computeParent(a: IntervalTreeNode, b: IntervalTreeNode): IntervalTreeNode {
    if (JSBI.greaterThan(a.start.data, b.start.data)) {
      throw new Error('left.start is not less than right.start.')
    }
    return new IntervalTreeNode(
      b.start,
      FixedBytes.from(
        32,
        this.hashAlgorythm.hash(Bytes.concat([a.encode(), b.encode()])).data
      )
    )
  }

  createEmptyNode(): IntervalTreeNode {
    return new IntervalTreeNode(
      BigNumber.MAX_NUMBER,
      FixedBytes.from(32, this.hashAlgorythm.hash(Bytes.default()).data)
    )
  }
  /**
   * compare BigNumber
   */
  compare(a: BigNumber, b: BigNumber): number {
    if (JSBI.greaterThan(a.data, b.data)) return 1
    else if (JSBI.equal(a.data, b.data)) return 0
    else return -1
  }
}
