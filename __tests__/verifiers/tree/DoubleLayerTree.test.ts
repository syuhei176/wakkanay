import {
  DoubleLayerTree,
  DoubleLayerTreeGenerator,
  DoubleLayerTreeLeaf,
  DoubleLayerTreeVerifier,
  AddressTreeInclusionProof,
  IntervalTreeInclusionProof,
  AddressTreeNode,
  IntervalTreeNode
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
        expect(inclusionProof0).toEqual({
          addressInclusionProof: new AddressTreeInclusionProof(0, [
            new AddressTreeNode(
              Address.from('0x0000000000000000000000000000000000000001'),
              Bytes.fromHexString(
                '0x3976203688d2e19df2eeb8f1b6dd81dc84b9c69fa9bab08e133d9633859eb2c3'
              )
            )
          ]),
          intervalInclusionProof: new IntervalTreeInclusionProof(0, [
            new IntervalTreeNode(
              Integer.from(7),
              Bytes.fromHexString(
                '0x036491cc10808eeb0ff717314df6f19ba2e232d04d5f039f6fa382cae41641da'
              )
            ),
            new IntervalTreeNode(
              Integer.from(5000),
              Bytes.fromHexString(
                '0xe2c6d421a374d1a99d7f7a0edab00248456de98c4481a3bc50b69d7078be1c42'
              )
            )
          ])
        })
        expect(inclusionProof1).toEqual({
          addressInclusionProof: new AddressTreeInclusionProof(0, [
            new AddressTreeNode(
              Address.from('0x0000000000000000000000000000000000000001'),
              Bytes.fromHexString(
                '0x3976203688d2e19df2eeb8f1b6dd81dc84b9c69fa9bab08e133d9633859eb2c3'
              )
            )
          ]),
          intervalInclusionProof: new IntervalTreeInclusionProof(1, [
            new IntervalTreeNode(
              Integer.from(0),
              Bytes.fromHexString(
                '0x6fef85753a1881775100d9b0a36fd6c333db4e7f358b8413d3819b6246b66a30'
              )
            ),
            new IntervalTreeNode(
              Integer.from(5000),
              Bytes.fromHexString(
                '0xe2c6d421a374d1a99d7f7a0edab00248456de98c4481a3bc50b69d7078be1c42'
              )
            )
          ])
        })
      })
    })

    describe('verifyInclusion', () => {
      const validInclusionProofFor0 = {
        addressInclusionProof: new AddressTreeInclusionProof(0, [
          new AddressTreeNode(
            Address.from('0x0000000000000000000000000000000000000001'),
            Bytes.fromHexString(
              '0x3976203688d2e19df2eeb8f1b6dd81dc84b9c69fa9bab08e133d9633859eb2c3'
            )
          )
        ]),
        intervalInclusionProof: new IntervalTreeInclusionProof(0, [
          new IntervalTreeNode(
            Integer.from(7),
            Bytes.fromHexString(
              '0x036491cc10808eeb0ff717314df6f19ba2e232d04d5f039f6fa382cae41641da'
            )
          ),
          new IntervalTreeNode(
            Integer.from(5000),
            Bytes.fromHexString(
              '0xe2c6d421a374d1a99d7f7a0edab00248456de98c4481a3bc50b69d7078be1c42'
            )
          )
        ])
      }
      it('return true', async () => {
        const verifier = new DoubleLayerTreeVerifier()
        const root = Bytes.fromHexString(
          '0xa34d4463f99ddbe6ffb3448cb791d1ce820bdf24040fccd49ce0b263910ab56e'
        )
        const result = verifier.verifyInclusion(
          leaf0,
          root,
          validInclusionProofFor0
        )
        expect(result).toBeTruthy()
      })
      it('return false with invalid proof', async () => {
        const verifier = new DoubleLayerTreeVerifier()
        const root = Bytes.fromHexString(
          '0xa34d4463f99ddbe6ffb3448cb791d1ce820bdf24040fccd49ce0b263910ab56e'
        )
        const result = verifier.verifyInclusion(
          leaf1,
          root,
          validInclusionProofFor0
        )
        expect(result).toBeFalsy()
      })
      it('throw exception detecting intersection', async () => {
        const verifier = new DoubleLayerTreeVerifier()
        const root = Bytes.fromHexString(
          '0xa34d4463f99ddbe6ffb3448cb791d1ce820bdf24040fccd49ce0b263910ab56e'
        )
        const invalidInclusionProof = {
          addressInclusionProof: new AddressTreeInclusionProof(0, [
            new AddressTreeNode(
              Address.from('0x0000000000000000000000000000000000000001'),
              Bytes.fromHexString(
                '0x3976203688d2e19df2eeb8f1b6dd81dc84b9c69fa9bab08e133d9633859eb2c3'
              )
            )
          ]),
          intervalInclusionProof: new IntervalTreeInclusionProof(0, [
            new IntervalTreeNode(
              Integer.from(7),
              Bytes.fromHexString(
                '0x036491cc10808eeb0ff717314df6f19ba2e232d04d5f039f6fa382cae41641da'
              )
            ),
            new IntervalTreeNode(
              Integer.from(0),
              Bytes.fromHexString(
                '0xe2c6d421a374d1a99d7f7a0edab00248456de98c4481a3bc50b69d7078be1c42'
              )
            )
          ])
        }
        expect(() => {
          verifier.verifyInclusion(leaf0, root, invalidInclusionProof)
        }).toThrow(new Error('Invalid InclusionProof, intersection detected.'))
      })
      it('throw exception left.start is not less than right.start', async () => {
        const verifier = new DoubleLayerTreeVerifier()
        const root = Bytes.fromHexString(
          '0xa34d4463f99ddbe6ffb3448cb791d1ce820bdf24040fccd49ce0b263910ab56e'
        )
        const invalidInclusionProof = {
          addressInclusionProof: new AddressTreeInclusionProof(0, [
            new AddressTreeNode(
              Address.from('0x0000000000000000000000000000000000000001'),
              Bytes.fromHexString(
                '0x3976203688d2e19df2eeb8f1b6dd81dc84b9c69fa9bab08e133d9633859eb2c3'
              )
            )
          ]),
          intervalInclusionProof: new IntervalTreeInclusionProof(1, [
            new IntervalTreeNode(
              Integer.from(0),
              Bytes.fromHexString(
                '0x6fef85753a1881775100d9b0a36fd6c333db4e7f358b8413d3819b6246b66a30'
              )
            ),
            new IntervalTreeNode(
              Integer.from(0),
              Bytes.fromHexString(
                '0xe2c6d421a374d1a99d7f7a0edab00248456de98c4481a3bc50b69d7078be1c42'
              )
            )
          ])
        }
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
