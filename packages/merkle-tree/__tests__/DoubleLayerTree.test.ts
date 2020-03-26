import {
  DoubleLayerTree,
  DoubleLayerTreeGenerator,
  DoubleLayerTreeLeaf,
  DoubleLayerTreeVerifier,
  InclusionProof,
  AddressTreeNode,
  IntervalTreeNode,
  DoubleLayerInclusionProof,
  AddressTreeInclusionProof,
  IntervalTreeInclusionProof
} from '../src'
import {
  Bytes,
  FixedBytes,
  BigNumber,
  Address,
  Range
} from '@cryptoeconomicslab/primitives'
import { Keccak256 } from '@cryptoeconomicslab/hash'
import coder from '@cryptoeconomicslab/eth-coder'
import JSBI from 'jsbi'
import { setupContext } from '@cryptoeconomicslab/context'
setupContext({ coder })

function geenrateDoubleLayerTreeLeaf(
  address: Address,
  bn: number,
  data: string
) {
  return new DoubleLayerTreeLeaf(
    address,
    BigNumber.from(bn),
    FixedBytes.from(32, Keccak256.hash(Bytes.fromString(data)).data)
  )
}

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
    const leaf0 = geenrateDoubleLayerTreeLeaf(token0, 0, 'leaf0')
    const leaf1 = geenrateDoubleLayerTreeLeaf(token0, 7, 'leaf1')
    const leaf2 = geenrateDoubleLayerTreeLeaf(token0, 15, 'leaf2')
    const leaf3 = geenrateDoubleLayerTreeLeaf(token0, 5000, 'leaf3')
    const leaf10 = geenrateDoubleLayerTreeLeaf(token1, 100, 'token1leaf0')
    const leaf11 = geenrateDoubleLayerTreeLeaf(token1, 200, 'token1leaf1')

    describe('generate tree', () => {
      it('successfully generate tree', () => {
        expect(() => {
          new DoubleLayerTree([leaf0, leaf1, leaf2, leaf3])
        }).not.toThrowError()
      })

      it('fail to generate tree with invalid ordered leaves', () => {
        expect(() => {
          new DoubleLayerTree([leaf0, leaf3, leaf2, leaf1])
        }).toThrow(new Error('Invalid ordered leaves'))
      })
    })

    describe('getRoot', () => {
      it('throw exception invalid data length', async () => {
        const invalidLeaf = new DoubleLayerTreeLeaf(
          token0,
          BigNumber.from(JSBI.BigInt(500)),
          FixedBytes.fromHexString(1, '0x00')
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
          '0xd4e96e267ab3f6f1cc39bfcf489e781b5d406c2f776b07364badf188563ffe4e'
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
          addressInclusionProof: new InclusionProof(
            Address.from('0x0000000000000000000000000000000000000000'),
            0,
            [
              new AddressTreeNode(
                Address.from('0x0000000000000000000000000000000000000001'),
                FixedBytes.fromHexString(
                  32,
                  '0xdd779be20b84ced84b7cbbdc8dc98d901ecd198642313d35d32775d75d916d3a'
                )
              )
            ]
          ),
          intervalInclusionProof: new InclusionProof(
            BigNumber.from(JSBI.BigInt(0)),
            0,
            [
              new IntervalTreeNode(
                BigNumber.from(JSBI.BigInt(7)),
                FixedBytes.fromHexString(
                  32,
                  '0x036491cc10808eeb0ff717314df6f19ba2e232d04d5f039f6fa382cae41641da'
                )
              ),
              new IntervalTreeNode(
                BigNumber.from(JSBI.BigInt(5000)),
                FixedBytes.fromHexString(
                  32,
                  '0xef583c07cae62e3a002a9ad558064ae80db17162801132f9327e8bb6da16ea8a'
                )
              )
            ]
          )
        })
        expect(inclusionProof1).toEqual({
          addressInclusionProof: new InclusionProof(
            Address.from('0x0000000000000000000000000000000000000000'),
            0,
            [
              new AddressTreeNode(
                Address.from('0x0000000000000000000000000000000000000001'),
                FixedBytes.fromHexString(
                  32,
                  '0xdd779be20b84ced84b7cbbdc8dc98d901ecd198642313d35d32775d75d916d3a'
                )
              )
            ]
          ),
          intervalInclusionProof: new InclusionProof(
            BigNumber.from(JSBI.BigInt(7)),
            1,
            [
              new IntervalTreeNode(
                BigNumber.from(JSBI.BigInt(0)),
                FixedBytes.fromHexString(
                  32,
                  '0x6fef85753a1881775100d9b0a36fd6c333db4e7f358b8413d3819b6246b66a30'
                )
              ),
              new IntervalTreeNode(
                BigNumber.from(JSBI.BigInt(5000)),
                FixedBytes.fromHexString(
                  32,
                  '0xef583c07cae62e3a002a9ad558064ae80db17162801132f9327e8bb6da16ea8a'
                )
              )
            ]
          )
        })
      })
    })

    describe('verifyInclusion', () => {
      const validInclusionProofFor0: DoubleLayerInclusionProof = new DoubleLayerInclusionProof(
        new IntervalTreeInclusionProof(BigNumber.from(JSBI.BigInt(0)), 0, [
          new IntervalTreeNode(
            BigNumber.from(JSBI.BigInt(7)),
            FixedBytes.fromHexString(
              32,
              '0x036491cc10808eeb0ff717314df6f19ba2e232d04d5f039f6fa382cae41641da'
            )
          ),
          new IntervalTreeNode(
            BigNumber.from(JSBI.BigInt(5000)),
            FixedBytes.fromHexString(
              32,
              '0xef583c07cae62e3a002a9ad558064ae80db17162801132f9327e8bb6da16ea8a'
            )
          )
        ]),
        new AddressTreeInclusionProof(
          Address.from('0x0000000000000000000000000000000000000000'),
          0,
          [
            new AddressTreeNode(
              Address.from('0x0000000000000000000000000000000000000001'),
              FixedBytes.fromHexString(
                32,
                '0xdd779be20b84ced84b7cbbdc8dc98d901ecd198642313d35d32775d75d916d3a'
              )
            )
          ]
        )
      )
      it('return true', async () => {
        const verifier = new DoubleLayerTreeVerifier()
        const root = FixedBytes.fromHexString(
          32,
          '0xd4e96e267ab3f6f1cc39bfcf489e781b5d406c2f776b07364badf188563ffe4e'
        )
        const result = verifier.verifyInclusion(
          leaf0,
          new Range(
            BigNumber.from(JSBI.BigInt(0)),
            BigNumber.from(JSBI.BigInt(7))
          ),
          root,
          validInclusionProofFor0
        )
        expect(result).toBeTruthy()
      })
      it('return true for 2', async () => {
        const verifier = new DoubleLayerTreeVerifier()
        const root = FixedBytes.fromHexString(
          32,
          '0xd4e96e267ab3f6f1cc39bfcf489e781b5d406c2f776b07364badf188563ffe4e'
        )
        const validInclusionProofFor2 = new DoubleLayerInclusionProof(
          new IntervalTreeInclusionProof(BigNumber.from(JSBI.BigInt(15)), 2, [
            new IntervalTreeNode(
              BigNumber.from(JSBI.BigInt(5000)),
              FixedBytes.fromHexString(
                32,
                '0xfdd1f2a1ec75fe968421a41d2282200de6bec6a21f81080a71b1053d9c0120f3'
              )
            ),
            new IntervalTreeNode(
              BigNumber.from(JSBI.BigInt(7)),
              FixedBytes.fromHexString(
                32,
                '0x59a76952828fd54de12b708bf0030e055ae148c0a5a7d8b4f191d519275337e8'
              )
            )
          ]),
          new AddressTreeInclusionProof(
            Address.from('0x0000000000000000000000000000000000000000'),
            0,
            [
              new AddressTreeNode(
                Address.from('0x0000000000000000000000000000000000000001'),
                FixedBytes.fromHexString(
                  32,
                  '0xdd779be20b84ced84b7cbbdc8dc98d901ecd198642313d35d32775d75d916d3a'
                )
              )
            ]
          )
        )
        const result = verifier.verifyInclusion(
          leaf2,
          new Range(
            BigNumber.from(JSBI.BigInt(15)),
            BigNumber.from(JSBI.BigInt(20))
          ),
          root,
          validInclusionProofFor2
        )
        expect(result).toBeTruthy()
      })

      it('return false with invalid proof', async () => {
        const verifier = new DoubleLayerTreeVerifier()
        const root = FixedBytes.fromHexString(
          32,
          '0x1aa3429d5aa7bf693f3879fdfe0f1a979a4b49eaeca9638fea07ad7ee5f0b64f'
        )
        expect(() => {
          verifier.verifyInclusion(
            leaf1,
            new Range(
              BigNumber.from(JSBI.BigInt(0)),
              BigNumber.from(JSBI.BigInt(7))
            ),
            root,
            validInclusionProofFor0
          )
        }).toThrow(
          new Error('required range must not exceed the implicit range')
        )
      })
      it('throw exception with invalid range', async () => {
        const verifier = new DoubleLayerTreeVerifier()
        const root = FixedBytes.fromHexString(
          32,
          '0x1aa3429d5aa7bf693f3879fdfe0f1a979a4b49eaeca9638fea07ad7ee5f0b64f'
        )
        expect(() => {
          verifier.verifyInclusion(
            leaf0,
            new Range(
              BigNumber.from(JSBI.BigInt(0)),
              BigNumber.from(JSBI.BigInt(20))
            ),
            root,
            validInclusionProofFor0
          )
        }).toThrow(
          new Error('required range must not exceed the implicit range')
        )
      })

      it('throw exception detecting intersection', async () => {
        const verifier = new DoubleLayerTreeVerifier()
        const root = FixedBytes.fromHexString(
          32,
          '0x1aa3429d5aa7bf693f3879fdfe0f1a979a4b49eaeca9638fea07ad7ee5f0b64f'
        )
        const invalidInclusionProof = new DoubleLayerInclusionProof(
          new IntervalTreeInclusionProof(BigNumber.from(JSBI.BigInt(0)), 0, [
            new IntervalTreeNode(
              BigNumber.from(JSBI.BigInt(7)),
              FixedBytes.fromHexString(
                32,
                '0x036491cc10808eeb0ff717314df6f19ba2e232d04d5f039f6fa382cae41641da'
              )
            ),
            new IntervalTreeNode(
              BigNumber.from(JSBI.BigInt(0)),
              FixedBytes.fromHexString(
                32,
                '0xef583c07cae62e3a002a9ad558064ae80db17162801132f9327e8bb6da16ea8a'
              )
            )
          ]),
          new AddressTreeInclusionProof(
            Address.from('0x0000000000000000000000000000000000000000'),
            0,
            [
              new AddressTreeNode(
                Address.from('0x0000000000000000000000000000000000000001'),
                FixedBytes.fromHexString(
                  32,
                  '0xdd779be20b84ced84b7cbbdc8dc98d901ecd198642313d35d32775d75d916d3a'
                )
              )
            ]
          )
        )
        expect(() => {
          verifier.verifyInclusion(
            leaf0,
            new Range(
              BigNumber.from(JSBI.BigInt(0)),
              BigNumber.from(JSBI.BigInt(7))
            ),
            root,
            invalidInclusionProof
          )
        }).toThrow(new Error('Invalid InclusionProof, intersection detected.'))
      })
      it('throw exception left.start is not less than right.start', async () => {
        const verifier = new DoubleLayerTreeVerifier()
        const root = FixedBytes.fromHexString(
          32,
          '0x1aa3429d5aa7bf693f3879fdfe0f1a979a4b49eaeca9638fea07ad7ee5f0b64f'
        )
        const invalidInclusionProof = new DoubleLayerInclusionProof(
          new IntervalTreeInclusionProof(BigNumber.from(JSBI.BigInt(7)), 1, [
            new IntervalTreeNode(
              BigNumber.from(JSBI.BigInt(0)),
              FixedBytes.fromHexString(
                32,
                '0x6fef85753a1881775100d9b0a36fd6c333db4e7f358b8413d3819b6246b66a30'
              )
            ),
            new IntervalTreeNode(
              BigNumber.from(JSBI.BigInt(0)),
              FixedBytes.fromHexString(
                32,
                '0xef583c07cae62e3a002a9ad558064ae80db17162801132f9327e8bb6da16ea8a'
              )
            )
          ]),
          new AddressTreeInclusionProof(
            Address.from('0x0000000000000000000000000000000000000000'),
            0,
            [
              new AddressTreeNode(
                Address.from('0x0000000000000000000000000000000000000001'),
                FixedBytes.fromHexString(
                  32,
                  '0xdd779be20b84ced84b7cbbdc8dc98d901ecd198642313d35d32775d75d916d3a'
                )
              )
            ]
          )
        )
        expect(() => {
          verifier.verifyInclusion(
            leaf1,
            new Range(
              BigNumber.from(JSBI.BigInt(7)),
              BigNumber.from(JSBI.BigInt(15))
            ),
            root,
            invalidInclusionProof
          )
        }).toThrow(new Error('left.start is not less than right.start.'))
      })
    })

    describe('getLeaves', () => {
      it('return leaves', async () => {
        const tree = new DoubleLayerTree([leaf0, leaf1, leaf2, leaf3])
        const leaves = tree.getLeaves(token0, JSBI.BigInt(0), JSBI.BigInt(100))
        expect(leaves.length).toStrictEqual(3)
      })
      it('return leaves within partially', async () => {
        const tree = new DoubleLayerTree([leaf0, leaf1, leaf2, leaf3])
        const leaves = tree.getLeaves(token0, JSBI.BigInt(5), JSBI.BigInt(100))
        expect(leaves.length).toStrictEqual(3)
      })
    })
  })

  describe('coding', () => {
    it('encode and decode', () => {
      const inclusionProof: DoubleLayerInclusionProof = new DoubleLayerInclusionProof(
        new IntervalTreeInclusionProof(BigNumber.from(JSBI.BigInt(0)), 0, [
          new IntervalTreeNode(
            BigNumber.from(JSBI.BigInt(7)),
            FixedBytes.fromHexString(
              32,
              '0x036491cc10808eeb0ff717314df6f19ba2e232d04d5f039f6fa382cae41641da'
            )
          ),
          new IntervalTreeNode(
            BigNumber.from(JSBI.BigInt(5000)),
            FixedBytes.fromHexString(
              32,
              '0xef583c07cae62e3a002a9ad558064ae80db17162801132f9327e8bb6da16ea8a'
            )
          )
        ]),
        new AddressTreeInclusionProof(
          Address.from('0x0000000000000000000000000000000000000000'),
          0,
          [
            new AddressTreeNode(
              Address.from('0x0000000000000000000000000000000000000001'),
              FixedBytes.fromHexString(
                32,
                '0xdd779be20b84ced84b7cbbdc8dc98d901ecd198642313d35d32775d75d916d3a'
              )
            )
          ]
        )
      )
      const encoded = coder.encode(inclusionProof.toStruct())
      const decoded = DoubleLayerInclusionProof.fromStruct(
        coder.decode(DoubleLayerInclusionProof.getParamType(), encoded)
      )
      expect(decoded).toEqual(inclusionProof)
    })
  })
})
