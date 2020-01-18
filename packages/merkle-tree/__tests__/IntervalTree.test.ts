import {
  IntervalTree,
  IntervalTreeNode,
  IntervalTreeVerifier,
  IntervalTreeInclusionProof
} from '../src'
import { Keccak256 } from '@cryptoeconomicslab/hash'
import { Bytes, BigNumber } from '@cryptoeconomicslab/primitives'

describe('IntervalTree', () => {
  const leaf0 = new IntervalTreeNode(
    BigNumber.from(BigInt(0)),
    Keccak256.hash(Bytes.fromString('leaf0'))
  )
  const leaf1 = new IntervalTreeNode(
    BigNumber.from(BigInt(7)),
    Keccak256.hash(Bytes.fromString('leaf1'))
  )
  const leaf2 = new IntervalTreeNode(
    BigNumber.from(BigInt(15)),
    Keccak256.hash(Bytes.fromString('leaf2'))
  )
  const leaf3 = new IntervalTreeNode(
    BigNumber.from(BigInt(300)),
    Keccak256.hash(Bytes.fromString('leaf3'))
  )
  const leafBigNumber = new IntervalTreeNode(
    BigNumber.from(BigInt(72943610)),
    Keccak256.hash(Bytes.fromString('leaf4'))
  )
  beforeEach(() => {})
  describe('getRoot', () => {
    it('return Merkle Root with odd number of leaves', async () => {
      const tree = new IntervalTree([leaf0, leaf1, leaf2])
      const root = tree.getRoot()
      expect(root.toHexString()).toStrictEqual(
        '0x3ec5a3c49278e6d89a313d2f8716b1cf62534f3c31fdcade30809fd90ee47368'
      )
    })
    it('return Merkle Root with even number of leaves', async () => {
      const tree = new IntervalTree([leaf0, leaf1, leaf2, leaf3])
      const root = tree.getRoot()
      expect(root.toHexString()).toStrictEqual(
        '0x95703b48a33f3750929082600d9bdd890ffef2b8434c19607a741f0dcc8a70c8'
      )
    })
    it('return Merkle Root with leaf which has big number as start', async () => {
      const tree = new IntervalTree([leaf0, leaf1, leaf2, leaf3, leafBigNumber])
      const root = tree.getRoot()
      expect(root.toHexString()).toStrictEqual(
        '0x714ab06047e0791228efb82d081deb2a011079b58db69c409771499c59292798'
      )
    })
  })
  describe('getInclusionProof', () => {
    it('return InclusionProof', async () => {
      const tree = new IntervalTree([leaf0, leaf1, leaf2])
      const inclusionProof0 = tree.getInclusionProof(0)
      const inclusionProof1 = tree.getInclusionProof(1)
      expect(inclusionProof0).toEqual({
        leafIndex: BigNumber.from(BigInt(0)),
        leafPosition: 0,
        siblings: [
          new IntervalTreeNode(
            BigNumber.from(BigInt(7)),
            Bytes.fromHexString(
              '0x036491cc10808eeb0ff717314df6f19ba2e232d04d5f039f6fa382cae41641da'
            )
          ),
          new IntervalTreeNode(
            BigNumber.MAX_NUMBER,
            Bytes.fromHexString(
              '0xe99f92621ea9ca2e0709f58dc56c139ecf076c388952df2b5cd7a6ca1ae2df5c'
            )
          )
        ]
      })
      expect(inclusionProof1).toEqual({
        leafIndex: BigNumber.from(BigInt(7)),
        leafPosition: 1,
        siblings: [
          new IntervalTreeNode(
            BigNumber.from(BigInt(0)),
            Bytes.fromHexString(
              '0x6fef85753a1881775100d9b0a36fd6c333db4e7f358b8413d3819b6246b66a30'
            )
          ),
          new IntervalTreeNode(
            BigNumber.MAX_NUMBER,
            Bytes.fromHexString(
              '0xe99f92621ea9ca2e0709f58dc56c139ecf076c388952df2b5cd7a6ca1ae2df5c'
            )
          )
        ]
      })
    })
    it('return InclusionProof with even number of leaves', async () => {
      const tree = new IntervalTree([leaf0, leaf1, leaf2, leaf3])
      const inclusionProof0 = tree.getInclusionProof(0)
      const inclusionProof1 = tree.getInclusionProof(1)
      const inclusionProof2 = tree.getInclusionProof(2)
      const inclusionProof3 = tree.getInclusionProof(3)
      expect(inclusionProof0).toEqual({
        leafIndex: BigNumber.from(BigInt(0)),
        leafPosition: 0,
        siblings: [
          new IntervalTreeNode(
            BigNumber.from(BigInt(7)),
            Bytes.fromHexString(
              '0x036491cc10808eeb0ff717314df6f19ba2e232d04d5f039f6fa382cae41641da'
            )
          ),
          new IntervalTreeNode(
            BigNumber.from(BigInt(300)),
            Bytes.fromHexString(
              '0x3b93a2a95fbcfbefdd3b6604f965379833a263fb74913f970b201fb7e1d5949e'
            )
          )
        ]
      })
      expect(inclusionProof1).toEqual({
        leafIndex: BigNumber.from(BigInt(7)),
        leafPosition: 1,
        siblings: [
          new IntervalTreeNode(
            BigNumber.from(BigInt(0)),
            Bytes.fromHexString(
              '0x6fef85753a1881775100d9b0a36fd6c333db4e7f358b8413d3819b6246b66a30'
            )
          ),
          new IntervalTreeNode(
            BigNumber.from(BigInt(300)),
            Bytes.fromHexString(
              '0x3b93a2a95fbcfbefdd3b6604f965379833a263fb74913f970b201fb7e1d5949e'
            )
          )
        ]
      })
      expect(inclusionProof2).toEqual({
        leafIndex: BigNumber.from(BigInt(15)),
        leafPosition: 2,
        siblings: [
          new IntervalTreeNode(
            BigNumber.from(BigInt(300)),
            Bytes.fromHexString(
              '0xfdd1f2a1ec75fe968421a41d2282200de6bec6a21f81080a71b1053d9c0120f3'
            )
          ),
          new IntervalTreeNode(
            BigNumber.from(BigInt(7)),
            Bytes.fromHexString(
              '0x59a76952828fd54de12b708bf0030e055ae148c0a5a7d8b4f191d519275337e8'
            )
          )
        ]
      })
      expect(inclusionProof3).toEqual({
        leafIndex: BigNumber.from(BigInt(300)),
        leafPosition: 3,
        siblings: [
          new IntervalTreeNode(
            BigNumber.from(BigInt(15)),
            Bytes.fromHexString(
              '0xba620d61dac4ddf2d7905722b259b0bd34ec4d37c5796d9a22537c54b3f972d8'
            )
          ),
          new IntervalTreeNode(
            BigNumber.from(BigInt(7)),
            Bytes.fromHexString(
              '0x59a76952828fd54de12b708bf0030e055ae148c0a5a7d8b4f191d519275337e8'
            )
          )
        ]
      })
    })
  })
  describe('verifyInclusion', () => {
    const verifier = new IntervalTreeVerifier()
    it('return true', async () => {
      const tree = new IntervalTree([leaf0, leaf1, leaf2])
      const root = tree.getRoot()
      const inclusionProof = tree.getInclusionProof(0)
      const result = verifier.verifyInclusion(
        leaf0,
        leaf0.start,
        leaf1.start,
        root,
        inclusionProof
      )
      expect(result).toBeTruthy()
    })
    it('return true with even number of leaves', async () => {
      const tree = new IntervalTree([leaf0, leaf1, leaf2, leafBigNumber])
      const root = tree.getRoot()
      const inclusionProof0 = tree.getInclusionProof(0)
      const inclusionProof1 = tree.getInclusionProof(1)
      const inclusionProof2 = tree.getInclusionProof(2)
      const inclusionProof3 = tree.getInclusionProof(3)
      const result0 = verifier.verifyInclusion(
        leaf0,
        leaf0.start,
        leaf1.start,
        root,
        inclusionProof0
      )
      expect(result0).toBeTruthy()
      const result1 = verifier.verifyInclusion(
        leaf1,
        leaf1.start,
        leaf2.start,
        root,
        inclusionProof1
      )
      expect(result1).toBeTruthy()
      const result2 = verifier.verifyInclusion(
        leaf2,
        leaf2.start,
        leaf3.start,
        root,
        inclusionProof2
      )
      expect(result2).toBeTruthy()
      const result3 = verifier.verifyInclusion(
        leafBigNumber,
        leafBigNumber.start,
        BigNumber.from(leafBigNumber.start.data + BigInt(1)),
        root,
        inclusionProof3
      )
      expect(result3).toBeTruthy()
    })
    it('return false with invalid leaf', async () => {
      const tree = new IntervalTree([leaf0, leaf1, leaf2, leafBigNumber])
      const root = tree.getRoot()
      const inclusionProof0 = tree.getInclusionProof(0)
      const result0 = verifier.verifyInclusion(
        leaf1,
        leaf1.start,
        leaf1.start,
        root,
        inclusionProof0
      )
      expect(result0).toBeFalsy()
    })
    it('throw exception detecting intersection', () => {
      const root = Bytes.fromHexString(
        '0x91d07b5d34a03ce1831ff23c6528d2cbf64adc24e3321373dc616a6740b02577'
      )
      const invalidInclusionProof = new IntervalTreeInclusionProof(
        BigNumber.from(BigInt(0)),
        0,
        [
          new IntervalTreeNode(
            BigNumber.from(BigInt(7)),
            Bytes.fromHexString(
              '0x036491cc10808eeb0ff717314df6f19ba2e232d04d5f039f6fa382cae41641da'
            )
          ),
          new IntervalTreeNode(
            BigNumber.from(BigInt(0)),
            Bytes.fromHexString(
              '0x4670e484ff31d2ec8471b1f8a1e1cb8dc104b3a4b766ae0b7c2c604a34cb530e'
            )
          )
        ]
      )
      expect(() => {
        verifier.verifyInclusion(
          leaf0,
          leaf0.start,
          leaf1.start,
          root,
          invalidInclusionProof
        )
      }).toThrow(new Error('Invalid InclusionProof, intersection detected.'))
    })
    it('throw exception left.start is not less than right.start', () => {
      const root = Bytes.fromHexString(
        '0x91d07b5d34a03ce1831ff23c6528d2cbf64adc24e3321373dc616a6740b02577'
      )
      const invalidInclusionProof = new IntervalTreeInclusionProof(
        BigNumber.from(BigInt(7)),
        1,
        [
          new IntervalTreeNode(
            BigNumber.from(BigInt(0)),
            Bytes.fromHexString(
              '0x6fef85753a1881775100d9b0a36fd6c333db4e7f358b8413d3819b6246b66a30'
            )
          ),
          new IntervalTreeNode(
            BigNumber.from(BigInt(0)),
            Bytes.fromHexString(
              '0x4670e484ff31d2ec8471b1f8a1e1cb8dc104b3a4b766ae0b7c2c604a34cb530e'
            )
          )
        ]
      )
      expect(() => {
        verifier.verifyInclusion(
          leaf1,
          leaf1.start,
          leaf2.start,
          root,
          invalidInclusionProof
        )
      }).toThrow(new Error('left.start is not less than right.start.'))
    })
  })
  describe('getLeaves', () => {
    it('return leaves', async () => {
      const tree = new IntervalTree([leaf0, leaf1, leaf2])
      const leaves = tree.getLeaves(BigInt(0), BigInt(100))
      expect(leaves.length).toStrictEqual(3)
    })
    it('return leaves within partially', async () => {
      const tree = new IntervalTree([leaf0, leaf1, leaf2])
      const leaves = tree.getLeaves(BigInt(5), BigInt(100))
      expect(leaves.length).toStrictEqual(3)
    })
  })
})
