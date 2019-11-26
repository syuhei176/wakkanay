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
import { Bytes, BigNumber, Address } from '../../../src/types'
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
      BigNumber.from(0n),
      Keccak256.hash(Bytes.fromString('leaf0'))
    )
    const leaf1 = new DoubleLayerTreeLeaf(
      token0,
      BigNumber.from(7n),
      Keccak256.hash(Bytes.fromString('leaf1'))
    )
    const leaf2 = new DoubleLayerTreeLeaf(
      token0,
      BigNumber.from(15n),
      Keccak256.hash(Bytes.fromString('leaf2'))
    )
    const leaf3 = new DoubleLayerTreeLeaf(
      token0,
      BigNumber.from(5000n),
      Keccak256.hash(Bytes.fromString('leaf3'))
    )
    const leaf10 = new DoubleLayerTreeLeaf(
      token1,
      BigNumber.from(100n),
      Keccak256.hash(Bytes.fromString('token1leaf0'))
    )
    const leaf11 = new DoubleLayerTreeLeaf(
      token1,
      BigNumber.from(200n),
      Keccak256.hash(Bytes.fromString('token1leaf1'))
    )
    beforeEach(() => {})
    describe('getRoot', () => {
      it('throw exception invalid data length', async () => {
        const invalidLeaf = new DoubleLayerTreeLeaf(
          token0,
          BigNumber.from(500n),
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
          '0x3ec5a3c49278e6d89a313d2f8716b1cf62534f3c31fdcade30809fd90ee47368'
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
          '0x1aa3429d5aa7bf693f3879fdfe0f1a979a4b49eaeca9638fea07ad7ee5f0b64f'
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
        console.log(
          inclusionProof0.intervalInclusionProof.siblings[1].data.toHexString()
        )
        console.log(
          inclusionProof1.intervalInclusionProof.siblings[1].data.toHexString()
        )
        expect(inclusionProof0).toEqual({
          addressInclusionProof: new AddressTreeInclusionProof(0, [
            new AddressTreeNode(
              Address.from('0x0000000000000000000000000000000000000001'),
              Bytes.fromHexString(
                '0xdd779be20b84ced84b7cbbdc8dc98d901ecd198642313d35d32775d75d916d3a'
              )
            )
          ]),
          intervalInclusionProof: new IntervalTreeInclusionProof(0, [
            new IntervalTreeNode(
              BigNumber.from(7n),
              Bytes.fromHexString(
                '0x036491cc10808eeb0ff717314df6f19ba2e232d04d5f039f6fa382cae41641da'
              )
            ),
            new IntervalTreeNode(
              BigNumber.from(5000n),
              Bytes.fromHexString(
                '0xef583c07cae62e3a002a9ad558064ae80db17162801132f9327e8bb6da16ea8a'
              )
            )
          ])
        })
        expect(inclusionProof1).toEqual({
          addressInclusionProof: new AddressTreeInclusionProof(0, [
            new AddressTreeNode(
              Address.from('0x0000000000000000000000000000000000000001'),
              Bytes.fromHexString(
                '0xdd779be20b84ced84b7cbbdc8dc98d901ecd198642313d35d32775d75d916d3a'
              )
            )
          ]),
          intervalInclusionProof: new IntervalTreeInclusionProof(1, [
            new IntervalTreeNode(
              BigNumber.from(0n),
              Bytes.fromHexString(
                '0x6fef85753a1881775100d9b0a36fd6c333db4e7f358b8413d3819b6246b66a30'
              )
            ),
            new IntervalTreeNode(
              BigNumber.from(5000n),
              Bytes.fromHexString(
                '0xef583c07cae62e3a002a9ad558064ae80db17162801132f9327e8bb6da16ea8a'
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
              '0xdd779be20b84ced84b7cbbdc8dc98d901ecd198642313d35d32775d75d916d3a'
            )
          )
        ]),
        intervalInclusionProof: new IntervalTreeInclusionProof(0, [
          new IntervalTreeNode(
            BigNumber.from(7n),
            Bytes.fromHexString(
              '0x036491cc10808eeb0ff717314df6f19ba2e232d04d5f039f6fa382cae41641da'
            )
          ),
          new IntervalTreeNode(
            BigNumber.from(5000n),
            Bytes.fromHexString(
              '0xef583c07cae62e3a002a9ad558064ae80db17162801132f9327e8bb6da16ea8a'
            )
          )
        ])
      }
      it('return true', async () => {
        const verifier = new DoubleLayerTreeVerifier()
        const root = Bytes.fromHexString(
          '0x1aa3429d5aa7bf693f3879fdfe0f1a979a4b49eaeca9638fea07ad7ee5f0b64f'
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
          '0x1aa3429d5aa7bf693f3879fdfe0f1a979a4b49eaeca9638fea07ad7ee5f0b64f'
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
          '0x1aa3429d5aa7bf693f3879fdfe0f1a979a4b49eaeca9638fea07ad7ee5f0b64f'
        )
        const invalidInclusionProof = {
          addressInclusionProof: new AddressTreeInclusionProof(0, [
            new AddressTreeNode(
              Address.from('0x0000000000000000000000000000000000000001'),
              Bytes.fromHexString(
                '0xdd779be20b84ced84b7cbbdc8dc98d901ecd198642313d35d32775d75d916d3a'
              )
            )
          ]),
          intervalInclusionProof: new IntervalTreeInclusionProof(0, [
            new IntervalTreeNode(
              BigNumber.from(7n),
              Bytes.fromHexString(
                '0x036491cc10808eeb0ff717314df6f19ba2e232d04d5f039f6fa382cae41641da'
              )
            ),
            new IntervalTreeNode(
              BigNumber.from(0n),
              Bytes.fromHexString(
                '0xef583c07cae62e3a002a9ad558064ae80db17162801132f9327e8bb6da16ea8a'
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
          '0x1aa3429d5aa7bf693f3879fdfe0f1a979a4b49eaeca9638fea07ad7ee5f0b64f'
        )
        const invalidInclusionProof = {
          addressInclusionProof: new AddressTreeInclusionProof(0, [
            new AddressTreeNode(
              Address.from('0x0000000000000000000000000000000000000001'),
              Bytes.fromHexString(
                '0xdd779be20b84ced84b7cbbdc8dc98d901ecd198642313d35d32775d75d916d3a'
              )
            )
          ]),
          intervalInclusionProof: new IntervalTreeInclusionProof(1, [
            new IntervalTreeNode(
              BigNumber.from(0n),
              Bytes.fromHexString(
                '0x6fef85753a1881775100d9b0a36fd6c333db4e7f358b8413d3819b6246b66a30'
              )
            ),
            new IntervalTreeNode(
              BigNumber.from(0n),
              Bytes.fromHexString(
                '0xef583c07cae62e3a002a9ad558064ae80db17162801132f9327e8bb6da16ea8a'
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
        const leaves = tree.getLeaves(token0, BigInt(0), BigInt(100))
        expect(leaves.length).toStrictEqual(3)
      })
      it('return leaves within partially', async () => {
        const tree = new DoubleLayerTree([leaf0, leaf1, leaf2, leaf3])
        const leaves = tree.getLeaves(token0, BigInt(5), BigInt(100))
        expect(leaves.length).toStrictEqual(3)
      })
    })
  })
})
