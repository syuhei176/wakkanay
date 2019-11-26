import {
  IntervalTree,
  IntervalTreeNode,
  IntervalTreeVerifier
} from '../../../src/verifiers/tree'
import { Keccak256 } from '../../../src/verifiers/hash/Keccak256'
import { Bytes, BigNumber } from '../../../src/types'

describe('IntervalTree', () => {
  const leaf0 = new IntervalTreeNode(
    BigNumber.from(BigInt(0)),
    Keccak256.hash(Bytes.fromString('leaf0'))
  )
  const leaf1 = new IntervalTreeNode(
    BigNumber.from(7n),
    Keccak256.hash(Bytes.fromString('leaf1'))
  )
  const leaf2 = new IntervalTreeNode(
    BigNumber.from(15n),
    Keccak256.hash(Bytes.fromString('leaf2'))
  )
  const leaf3 = new IntervalTreeNode(
    BigNumber.from(300n),
    Keccak256.hash(Bytes.fromString('leaf3'))
  )
  const leafBigNumber = new IntervalTreeNode(
    BigNumber.from(72943610n),
    Keccak256.hash(Bytes.fromString('leaf4'))
  )
  beforeEach(() => {})
  describe('getRoot', () => {
    it('return Merkle Root with odd number of leaves', async () => {
      const tree = new IntervalTree([leaf0, leaf1, leaf2])
      const root = tree.getRoot()
      expect(root.toHexString()).toStrictEqual(
        '0xb3c02deef1a1beeaa2899ac0fbeca57a13aa36dff9742c974113f2ceef7f7278'
      )
    })
    it('return Merkle Root with even number of leaves', async () => {
      const tree = new IntervalTree([leaf0, leaf1, leaf2, leaf3])
      const root = tree.getRoot()
      expect(root.toHexString()).toStrictEqual(
        '0x295438ca451d0bfcb2ae28086c9a7d79bdf94736eac89b9e44a1af3f257fcb5d'
      )
    })
    it('return Merkle Root with leaf which has big number as start', async () => {
      const tree = new IntervalTree([leaf0, leaf1, leaf2, leaf3, leafBigNumber])
      const root = tree.getRoot()
      expect(root.toHexString()).toStrictEqual(
        '0x32ceeebf21cc9f9562929b7c84ab64224fc73bc4042e06740d6492145b0cb9a5'
      )
    })
  })
  describe('getInclusionProof', () => {
    it('return InclusionProof', async () => {
      const tree = new IntervalTree([leaf0, leaf1, leaf2])
      const inclusionProof0 = tree.getInclusionProof(0)
      const inclusionProof1 = tree.getInclusionProof(1)
      expect(inclusionProof0).toStrictEqual({
        leafPosition: 0,
        siblings: [
          new IntervalTreeNode(
            BigNumber.from(7n),
            Bytes.fromHexString(
              '0x036491cc10808eeb0ff717314df6f19ba2e232d04d5f039f6fa382cae41641da'
            )
          ),
          new IntervalTreeNode(
            BigNumber.MAX_NUMBER,
            Bytes.fromHexString(
              '0x70292008554cf98a985dae6b98f9a3a3247f40b02c7b0e210f49fd4d1925b010'
            )
          )
        ]
      })
      expect(inclusionProof1).toStrictEqual({
        leafPosition: 1,
        siblings: [
          new IntervalTreeNode(
            BigNumber.from(0n),
            Bytes.fromHexString(
              '0x6fef85753a1881775100d9b0a36fd6c333db4e7f358b8413d3819b6246b66a30'
            )
          ),
          new IntervalTreeNode(
            BigNumber.MAX_NUMBER,
            Bytes.fromHexString(
              '0x70292008554cf98a985dae6b98f9a3a3247f40b02c7b0e210f49fd4d1925b010'
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
      expect(inclusionProof0).toStrictEqual({
        leafPosition: 0,
        siblings: [
          new IntervalTreeNode(
            BigNumber.from(7n),
            Bytes.fromHexString(
              '0x036491cc10808eeb0ff717314df6f19ba2e232d04d5f039f6fa382cae41641da'
            )
          ),
          new IntervalTreeNode(
            BigNumber.from(300n),
            Bytes.fromHexString(
              '0xbb3c3d12ce9cc6b2de4be3085a5d82baedb44b622ab80853020104e03b9fa34e'
            )
          )
        ]
      })
      expect(inclusionProof1).toStrictEqual({
        leafPosition: 1,
        siblings: [
          new IntervalTreeNode(
            BigNumber.from(0n),
            Bytes.fromHexString(
              '0x6fef85753a1881775100d9b0a36fd6c333db4e7f358b8413d3819b6246b66a30'
            )
          ),
          new IntervalTreeNode(
            BigNumber.from(300n),
            Bytes.fromHexString(
              '0xbb3c3d12ce9cc6b2de4be3085a5d82baedb44b622ab80853020104e03b9fa34e'
            )
          )
        ]
      })
      expect(inclusionProof2).toStrictEqual({
        leafPosition: 2,
        siblings: [
          new IntervalTreeNode(
            BigNumber.from(300n),
            Bytes.fromHexString(
              '0xfdd1f2a1ec75fe968421a41d2282200de6bec6a21f81080a71b1053d9c0120f3'
            )
          ),
          new IntervalTreeNode(
            BigNumber.from(7n),
            Bytes.fromHexString(
              '0xd62f20cef4c9739c04c2302624e272673b3655b450f1e6afbe8a28bab1d78f95'
            )
          )
        ]
      })
      expect(inclusionProof3).toStrictEqual({
        leafPosition: 3,
        siblings: [
          new IntervalTreeNode(
            BigNumber.from(15n),
            Bytes.fromHexString(
              '0xba620d61dac4ddf2d7905722b259b0bd34ec4d37c5796d9a22537c54b3f972d8'
            )
          ),
          new IntervalTreeNode(
            BigNumber.from(7n),
            Bytes.fromHexString(
              '0xd62f20cef4c9739c04c2302624e272673b3655b450f1e6afbe8a28bab1d78f95'
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
      const result = verifier.verifyInclusion(leaf0, root, inclusionProof)
      expect(result).toBeTruthy()
    })
    it('return true with even number of leaves', async () => {
      const tree = new IntervalTree([leaf0, leaf1, leaf2, leafBigNumber])
      const root = tree.getRoot()
      const inclusionProof0 = tree.getInclusionProof(0)
      const inclusionProof1 = tree.getInclusionProof(1)
      const inclusionProof2 = tree.getInclusionProof(2)
      const inclusionProof3 = tree.getInclusionProof(3)
      const result0 = verifier.verifyInclusion(leaf0, root, inclusionProof0)
      expect(result0).toBeTruthy()
      const result1 = verifier.verifyInclusion(leaf1, root, inclusionProof1)
      expect(result1).toBeTruthy()
      const result2 = verifier.verifyInclusion(leaf2, root, inclusionProof2)
      expect(result2).toBeTruthy()
      const result3 = verifier.verifyInclusion(
        leafBigNumber,
        root,
        inclusionProof3
      )
      expect(result3).toBeTruthy()
    })
    it('return false with invalid leaf', async () => {
      const tree = new IntervalTree([leaf0, leaf1, leaf2, leafBigNumber])
      const root = tree.getRoot()
      const inclusionProof0 = tree.getInclusionProof(0)
      const result0 = verifier.verifyInclusion(leaf1, root, inclusionProof0)
      expect(result0).toBeFalsy()
    })
    it('throw exception detecting intersection', () => {
      const root = Bytes.fromHexString(
        '0x295438ca451d0bfcb2ae28086c9a7d79bdf94736eac89b9e44a1af3f257fcb5d'
      )
      const invalidInclusionProof = {
        leafPosition: 0,
        siblings: [
          new IntervalTreeNode(
            BigNumber.from(7n),
            Bytes.fromHexString(
              '0x036491cc10808eeb0ff717314df6f19ba2e232d04d5f039f6fa382cae41641da'
            )
          ),
          new IntervalTreeNode(
            BigNumber.from(0n),
            Bytes.fromHexString(
              '0xbb3c3d12ce9cc6b2de4be3085a5d82baedb44b622ab80853020104e03b9fa34e'
            )
          )
        ]
      }
      expect(() => {
        verifier.verifyInclusion(leaf0, root, invalidInclusionProof)
      }).toThrow(new Error('Invalid InclusionProof, intersection detected.'))
    })
    it('throw exception left.start is not less than right.start', () => {
      const root = Bytes.fromHexString(
        '0x295438ca451d0bfcb2ae28086c9a7d79bdf94736eac89b9e44a1af3f257fcb5d'
      )
      const invalidInclusionProof = {
        leafPosition: 1,
        siblings: [
          new IntervalTreeNode(
            BigNumber.from(0n),
            Bytes.fromHexString(
              '0x6fef85753a1881775100d9b0a36fd6c333db4e7f358b8413d3819b6246b66a30'
            )
          ),
          new IntervalTreeNode(
            BigNumber.from(0n),
            Bytes.fromHexString(
              '0xbb3c3d12ce9cc6b2de4be3085a5d82baedb44b622ab80853020104e03b9fa34e'
            )
          )
        ]
      }
      expect(() => {
        verifier.verifyInclusion(leaf1, root, invalidInclusionProof)
      }).toThrow(new Error('left.start is not less than right.start.'))
    })
  })
  describe('getLeaves', () => {
    it('return leaves', async () => {
      const tree = new IntervalTree([leaf0, leaf1, leaf2])
      const leaves = tree.getLeaves(0n, 100n)
      expect(leaves.length).toStrictEqual(3)
    })
    it('return leaves within partially', async () => {
      const tree = new IntervalTree([leaf0, leaf1, leaf2])
      const leaves = tree.getLeaves(5n, 100n)
      expect(leaves.length).toStrictEqual(3)
    })
  })
})
