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
    const token0 = Address.default()
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
    beforeEach(() => {})
    describe('getRoot', () => {
      it('return Merkle Root', async () => {
        const tree = new DoubleLayerTree([leaf0, leaf1, leaf2])
        const root = tree.getRoot()
        expect(root.toHexString()).toStrictEqual(
          '0x4a49d1b90d42046cfbf2169ba520f7633d793645876370ac0acdb85f3fbcade6'
        )
      })
      it('return Merkle Root with 4 leaves', async () => {
        const tree = new DoubleLayerTree([leaf0, leaf1, leaf2, leaf3])
        const root = tree.getRoot()
        expect(root.toHexString()).toStrictEqual(
          '0x22a1b078fc6e327f3aeb1ce67f7bb8e79842af7d71b0010ae399dccedcbea9d3'
        )
      })
    })
    describe('getInclusionProof', () => {
      it('return Inclusion Proof', async () => {
        const tree = new DoubleLayerTree([leaf0, leaf1, leaf2, leaf3])
        const inclusionProof = tree.getInclusionProofByAddressAndIndex(
          token0,
          0
        )
        expect(inclusionProof.toHexString()).toStrictEqual(
          '0x4c00000000000000036491cc10808eeb0ff717314df6f19ba2e232d04d5f039f6fa382cae41641da07000000e2c6d421a374d1a99d7f7a0edab00248456de98c4481a3bc50b69d7078be1c428813000000000000'
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
    })
  })
})
