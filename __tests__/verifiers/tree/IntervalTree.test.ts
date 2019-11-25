import {
  IntervalTree,
  IntervalTreeNode,
  IntervalTreeVerifier
} from '../../../src/verifiers/tree'
import { Keccak256 } from '../../../src/verifiers/hash/Keccak256'
import { Bytes, Integer } from '../../../src/types'

describe('IntervalTree', () => {
  const leaf0 = new IntervalTreeNode(
    Integer.from(0),
    Keccak256.hash(Bytes.fromString('leaf0'))
  )
  const leaf1 = new IntervalTreeNode(
    Integer.from(7),
    Keccak256.hash(Bytes.fromString('leaf1'))
  )
  const leaf2 = new IntervalTreeNode(
    Integer.from(15),
    Keccak256.hash(Bytes.fromString('leaf2'))
  )
  const leaf3 = new IntervalTreeNode(
    Integer.from(300),
    Keccak256.hash(Bytes.fromString('leaf3'))
  )
  const leafBigNumber = new IntervalTreeNode(
    Integer.from(72943610),
    Keccak256.hash(Bytes.fromString('leaf4'))
  )
  beforeEach(() => {})
  describe('getRoot', () => {
    it('return Merkle Root with odd number of leaves', async () => {
      const tree = new IntervalTree([leaf0, leaf1, leaf2])
      const root = tree.getRoot()
      expect(root.toHexString()).toStrictEqual(
        '0x4a49d1b90d42046cfbf2169ba520f7633d793645876370ac0acdb85f3fbcade6'
      )
    })
    it('return Merkle Root with even number of leaves', async () => {
      const tree = new IntervalTree([leaf0, leaf1, leaf2, leaf3])
      const root = tree.getRoot()
      expect(root.toHexString()).toStrictEqual(
        '0x4117eee42ff1ddefc65223c1560b411da17da6a6afed5ea4796ca952cfa95587'
      )
    })
    it('return Merkle Root with leaf which has big number as start', async () => {
      const tree = new IntervalTree([leaf0, leaf1, leaf2, leaf3, leafBigNumber])
      const root = tree.getRoot()
      expect(root.toHexString()).toStrictEqual(
        '0x5fcc7e390d4144644a7299e5778fbf2e4aae70bbb0fe03a84e94267151e28017'
      )
    })
  })
  describe('getInclusionProof', () => {
    it('return InclusionProof', async () => {
      const tree = new IntervalTree([leaf0, leaf1, leaf2])
      const inclusionProof0 = tree.getInclusionProof(0)
      const inclusionProof1 = tree.getInclusionProof(1)
      expect(inclusionProof0.toHexString()).toStrictEqual(
        '0x00000000036491cc10808eeb0ff717314df6f19ba2e232d04d5f039f6fa382cae41641da07000000e773031f8fe828e549ae4da698004d32bb7f3510a8ca3794010f1fe5b0637b30ffffffff'
      )
      expect(inclusionProof1.toHexString()).toStrictEqual(
        '0x010000006fef85753a1881775100d9b0a36fd6c333db4e7f358b8413d3819b6246b66a3000000000e773031f8fe828e549ae4da698004d32bb7f3510a8ca3794010f1fe5b0637b30ffffffff'
      )
    })
    it('return InclusionProof with even number of leaves', async () => {
      const tree = new IntervalTree([leaf0, leaf1, leaf2, leaf3])
      const inclusionProof0 = tree.getInclusionProof(0)
      const inclusionProof1 = tree.getInclusionProof(1)
      const inclusionProof2 = tree.getInclusionProof(2)
      const inclusionProof3 = tree.getInclusionProof(3)
      expect(inclusionProof0.toHexString()).toStrictEqual(
        '0x00000000036491cc10808eeb0ff717314df6f19ba2e232d04d5f039f6fa382cae41641da07000000c09681b30efdae69430f6661b21f80c49a6864061578412256a53e92cefc253a2c010000'
      )
      expect(inclusionProof1.toHexString()).toStrictEqual(
        '0x010000006fef85753a1881775100d9b0a36fd6c333db4e7f358b8413d3819b6246b66a3000000000c09681b30efdae69430f6661b21f80c49a6864061578412256a53e92cefc253a2c010000'
      )
      expect(inclusionProof2.toHexString()).toStrictEqual(
        '0x02000000fdd1f2a1ec75fe968421a41d2282200de6bec6a21f81080a71b1053d9c0120f32c010000332102f598c3de984496b1e7c77d0e4c858a2e0e063ed2e1c63331e85c38173a07000000'
      )
      expect(inclusionProof3.toHexString()).toStrictEqual(
        '0x03000000ba620d61dac4ddf2d7905722b259b0bd34ec4d37c5796d9a22537c54b3f972d80f000000332102f598c3de984496b1e7c77d0e4c858a2e0e063ed2e1c63331e85c38173a07000000'
      )
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
        '0x4117eee42ff1ddefc65223c1560b411da17da6a6afed5ea4796ca952cfa95587'
      )
      const invalidInclusionProof = Bytes.fromHexString(
        '0x00000000036491cc10808eeb0ff717314df6f19ba2e232d04d5f039f6fa382cae41641da07000000c09681b30efdae69430f6661b21f80c49a6864061578412256a53e92cefc253a00000000'
      )
      expect(() => {
        verifier.verifyInclusion(leaf0, root, invalidInclusionProof)
      }).toThrow(new Error('Invalid InclusionProof, intersection detected.'))
    })
    it('throw exception left.start is not less than right.start', () => {
      const root = Bytes.fromHexString(
        '0x4117eee42ff1ddefc65223c1560b411da17da6a6afed5ea4796ca952cfa95587'
      )
      const invalidInclusionProof = Bytes.fromHexString(
        '0x010000006fef85753a1881775100d9b0a36fd6c333db4e7f358b8413d3819b6246b66a3000000000c09681b30efdae69430f6661b21f80c49a6864061578412256a53e92cefc253a00000000'
      )
      expect(() => {
        verifier.verifyInclusion(leaf1, root, invalidInclusionProof)
      }).toThrow(new Error('left.start is not less than right.start.'))
    })
  })
  describe('getLeaves', () => {
    it('return leaves', async () => {
      const tree = new IntervalTree([leaf0, leaf1, leaf2])
      const leaves = tree.getLeaves(0, 100)
      expect(leaves.length).toStrictEqual(3)
    })
    it('return leaves within partially', async () => {
      const tree = new IntervalTree([leaf0, leaf1, leaf2])
      const leaves = tree.getLeaves(5, 100)
      expect(leaves.length).toStrictEqual(3)
    })
  })
})
