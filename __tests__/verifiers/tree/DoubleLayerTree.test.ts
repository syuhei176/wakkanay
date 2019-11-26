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
          '0xb3c02deef1a1beeaa2899ac0fbeca57a13aa36dff9742c974113f2ceef7f7278'
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
          '0x035a06175d142ae49863b8a36ed96ab1501a2246d788d3bce130fbca6d6fb533'
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
                '0x5f57670cfe1f6a20e334282a42a5a340056876b4990beeaae749808323202803'
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
                '0x5c9325f01140a171a76dd4ac2111bfe6d404f7fd8fdee094ecfb0164a9c7315b'
              )
            )
          ])
        })
        expect(inclusionProof1).toEqual({
          addressInclusionProof: new AddressTreeInclusionProof(0, [
            new AddressTreeNode(
              Address.from('0x0000000000000000000000000000000000000001'),
              Bytes.fromHexString(
                '0x5f57670cfe1f6a20e334282a42a5a340056876b4990beeaae749808323202803'
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
                '0x5c9325f01140a171a76dd4ac2111bfe6d404f7fd8fdee094ecfb0164a9c7315b'
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
              '0x5f57670cfe1f6a20e334282a42a5a340056876b4990beeaae749808323202803'
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
              '0x5c9325f01140a171a76dd4ac2111bfe6d404f7fd8fdee094ecfb0164a9c7315b'
            )
          )
        ])
      }
      it('return true', async () => {
        const verifier = new DoubleLayerTreeVerifier()
        const root = Bytes.fromHexString(
          '0x035a06175d142ae49863b8a36ed96ab1501a2246d788d3bce130fbca6d6fb533'
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
          '0x035a06175d142ae49863b8a36ed96ab1501a2246d788d3bce130fbca6d6fb533'
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
          '0x035a06175d142ae49863b8a36ed96ab1501a2246d788d3bce130fbca6d6fb533'
        )
        const invalidInclusionProof = {
          addressInclusionProof: new AddressTreeInclusionProof(0, [
            new AddressTreeNode(
              Address.from('0x0000000000000000000000000000000000000001'),
              Bytes.fromHexString(
                '0x5f57670cfe1f6a20e334282a42a5a340056876b4990beeaae749808323202803'
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
                '0x5c9325f01140a171a76dd4ac2111bfe6d404f7fd8fdee094ecfb0164a9c7315b'
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
          '0x035a06175d142ae49863b8a36ed96ab1501a2246d788d3bce130fbca6d6fb533'
        )
        const invalidInclusionProof = {
          addressInclusionProof: new AddressTreeInclusionProof(0, [
            new AddressTreeNode(
              Address.from('0x0000000000000000000000000000000000000001'),
              Bytes.fromHexString(
                '0x5f57670cfe1f6a20e334282a42a5a340056876b4990beeaae749808323202803'
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
                '0x5c9325f01140a171a76dd4ac2111bfe6d404f7fd8fdee094ecfb0164a9c7315b'
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
