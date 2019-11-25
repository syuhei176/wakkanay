import {
  DoubleLayerTree,
  DoubleLayerTreeGenerator,
  DoubleLayerTreeLeaf,
  DoubleLayerTreeVerifier
} from '../../../src/verifiers/tree'
import { Bytes, Integer, Address } from '../../../src/types'
import { Keccak256 } from '../../../src/verifiers/hash/Keccak256'

describe('DoubleLayerTree', () => {
  describe('DoubleLayerTreeGenerator', () => {
    describe('generate', () => {
      it('return tree', async () => {
        const generator = new DoubleLayerTreeGenerator()
        expect(() => {
          generator.generate([])
        }).toThrow()
      })
    })
  })
  describe('DoubleLayerTree', () => {
    const token0 = Address.from('0x0000000000000000000000000000000000000000')
    const token1 = Address.from('0x0000000000000000000000000000000000000001')
    const leaf0 = new DoubleLayerTreeLeaf(
      token0,
      Integer.from(0),
      Keccak256.hash(Bytes.fromString('leaf0'))
    )
    const leaf1 = new DoubleLayerTreeLeaf(
      token0,
      Integer.from(7),
      Keccak256.hash(Bytes.fromString('leaf1'))
    )
    const leaf2 = new DoubleLayerTreeLeaf(
      token0,
      Integer.from(15),
      Keccak256.hash(Bytes.fromString('leaf2'))
    )
    const leaf3 = new DoubleLayerTreeLeaf(
      token0,
      Integer.from(5000),
      Keccak256.hash(Bytes.fromString('leaf3'))
    )
    const leaf10 = new DoubleLayerTreeLeaf(
      token1,
      Integer.from(100),
      Keccak256.hash(Bytes.fromString('token1leaf0'))
    )
    const leaf11 = new DoubleLayerTreeLeaf(
      token1,
      Integer.from(200),
      Keccak256.hash(Bytes.fromString('token1leaf1'))
    )
    beforeEach(() => {})
    describe('getRoot', () => {
      it('throw exception invalid data length', async () => {
        const invalidLeaf = new DoubleLayerTreeLeaf(
          token0,
          Integer.from(500),
          Bytes.fromString('leaf0')
        )
        expect(() => {
          new DoubleLayerTree([leaf0, leaf1, leaf2, invalidLeaf])
        }).toThrow(new Error('data length is not 32 bytes.'))
      })
      it('return Merkle Root', async () => {
        const tree = new DoubleLayerTree([leaf0, leaf1, leaf2])
        const root = tree.getRoot()
        expect(root.toHexString()).toStrictEqual(
          '0x4a49d1b90d42046cfbf2169ba520f7633d793645876370ac0acdb85f3fbcade6'
        )
      })
      it('return Merkle Root with leaves that belongs to multiple address', async () => {
        const tree = new DoubleLayerTree([
          leaf0,
          leaf1,
          leaf2,
          leaf3,
          leaf10,
          leaf11
        ])
        const root = tree.getRoot()
        expect(root.toHexString()).toStrictEqual(
          '0xa34d4463f99ddbe6ffb3448cb791d1ce820bdf24040fccd49ce0b263910ab56e'
        )
      })
    })
    describe('getInclusionProof', () => {
      it('return Inclusion Proof', async () => {
        const tree = new DoubleLayerTree([
          leaf0,
          leaf1,
          leaf2,
          leaf3,
          leaf10,
          leaf11
        ])
        const inclusionProof0 = tree.getInclusionProofByAddressAndIndex(
          token0,
          0
        )
        const inclusionProof1 = tree.getInclusionProofByAddressAndIndex(
          token0,
          1
        )
        expect(inclusionProof0.toHexString()).toStrictEqual(
          '0x4c00000000000000036491cc10808eeb0ff717314df6f19ba2e232d04d5f039f6fa382cae41641da07000000e2c6d421a374d1a99d7f7a0edab00248456de98c4481a3bc50b69d7078be1c4288130000000000003976203688d2e19df2eeb8f1b6dd81dc84b9c69fa9bab08e133d9633859eb2c30000000000000000000000000000000000000001'
        )
        expect(inclusionProof1.toHexString()).toStrictEqual(
          '0x4c000000010000006fef85753a1881775100d9b0a36fd6c333db4e7f358b8413d3819b6246b66a3000000000e2c6d421a374d1a99d7f7a0edab00248456de98c4481a3bc50b69d7078be1c4288130000000000003976203688d2e19df2eeb8f1b6dd81dc84b9c69fa9bab08e133d9633859eb2c30000000000000000000000000000000000000001'
        )
      })
    })
    describe('verifyInclusion', () => {
      it('return true', async () => {
        const verifier = new DoubleLayerTreeVerifier()
        const root = Bytes.fromHexString(
          '0x22a1b078fc6e327f3aeb1ce67f7bb8e79842af7d71b0010ae399dccedcbea9d3'
        )
        const inclusionProof = Bytes.fromHexString(
          '0x4c00000000000000036491cc10808eeb0ff717314df6f19ba2e232d04d5f039f6fa382cae41641da07000000e2c6d421a374d1a99d7f7a0edab00248456de98c4481a3bc50b69d7078be1c428813000000000000'
        )
        const result = verifier.verifyInclusion(leaf0, root, inclusionProof)
        expect(result).toBeTruthy()
      })
      it('return false with invalid proof', async () => {
        const verifier = new DoubleLayerTreeVerifier()
        const root = Bytes.fromHexString(
          '0x22a1b078fc6e327f3aeb1ce67f7bb8e79842af7d71b0010ae399dccedcbea9d3'
        )
        const inclusionProof = Bytes.fromHexString(
          '0x4c00000000000000036491cc10808eeb0ff717314df6f19ba2e232d04d5f039f6fa382cae41641da07000000e2c6d421a374d1a99d7f7a0edab00248456de98c4481a3bc50b69d7078be1c428813000000000000'
        )
        const result = verifier.verifyInclusion(leaf1, root, inclusionProof)
        expect(result).toBeFalsy()
      })
      it('throw exception detecting intersection', async () => {
        const verifier = new DoubleLayerTreeVerifier()
        const root = Bytes.fromHexString(
          '0x22a1b078fc6e327f3aeb1ce67f7bb8e79842af7d71b0010ae399dccedcbea9d3'
        )
        const invalidInclusionProof = Bytes.fromHexString(
          '0x4c00000000000000036491cc10808eeb0ff717314df6f19ba2e232d04d5f039f6fa382cae41641da07000000e2c6d421a374d1a99d7f7a0edab00248456de98c4481a3bc50b69d7078be1c4200000000000000003976203688d2e19df2eeb8f1b6dd81dc84b9c69fa9bab08e133d9633859eb2c30000000000000000000000000000000000000001'
        )
        expect(() => {
          verifier.verifyInclusion(leaf0, root, invalidInclusionProof)
        }).toThrow(new Error('Invalid InclusionProof, intersection detected.'))
      })
      it('throw exception left.start is not less than right.start', async () => {
        const verifier = new DoubleLayerTreeVerifier()
        const root = Bytes.fromHexString(
          '0x22a1b078fc6e327f3aeb1ce67f7bb8e79842af7d71b0010ae399dccedcbea9d3'
        )
        const invalidInclusionProof = Bytes.fromHexString(
          '0x4c000000010000006fef85753a1881775100d9b0a36fd6c333db4e7f358b8413d3819b6246b66a3000000000e2c6d421a374d1a99d7f7a0edab00248456de98c4481a3bc50b69d7078be1c4200000000000000003976203688d2e19df2eeb8f1b6dd81dc84b9c69fa9bab08e133d9633859eb2c30000000000000000000000000000000000000001'
        )
        expect(() => {
          verifier.verifyInclusion(leaf1, root, invalidInclusionProof)
        }).toThrow(new Error('left.start is not less than right.start.'))
      })
    })
    describe('getLeaves', () => {
      it('return leaves', async () => {
        const tree = new DoubleLayerTree([leaf0, leaf1, leaf2, leaf3])
        const leaves = tree.getLeaves(token0, 0, 100)
        expect(leaves.length).toStrictEqual(3)
      })
      it('return leaves within partially', async () => {
        const tree = new DoubleLayerTree([leaf0, leaf1, leaf2, leaf3])
        const leaves = tree.getLeaves(token0, 5, 100)
        expect(leaves.length).toStrictEqual(3)
      })
    })
  })
})
