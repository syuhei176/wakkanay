import {
  AddressTree,
  AddressTreeNode,
  AddressTreeVerifier,
  AddressTreeInclusionProof
} from '../src'
import { Address, FixedBytes, Bytes } from '@cryptoeconomicslab/primitives'
import { Keccak256 } from '@cryptoeconomicslab/hash'
import EthCoder from '@cryptoeconomicslab/eth-coder'
import { setupContext } from '@cryptoeconomicslab/context'
setupContext({ coder: EthCoder })

function toFixedBytes(bytes: Bytes, size: number) {
  return FixedBytes.from(size, bytes.data)
}

describe('AddressTree', () => {
  const leaf0 = new AddressTreeNode(
    Address.from('0x0000000000000000000000000000000000000000'),
    toFixedBytes(Keccak256.hash(Bytes.fromString('root0')), 32)
  )
  const leaf1 = new AddressTreeNode(
    Address.from('0x0000000000000000000000000000000000000001'),
    toFixedBytes(Keccak256.hash(Bytes.fromString('root1')), 32)
  )
  const leaf2 = new AddressTreeNode(
    Address.from('0x0000000000000000000000000000000000000002'),
    toFixedBytes(Keccak256.hash(Bytes.fromString('root2')), 32)
  )
  const leaf3 = new AddressTreeNode(
    Address.from('0x0000000000000000000000000000000000000003'),
    toFixedBytes(Keccak256.hash(Bytes.fromString('root3')), 32)
  )

  describe('coding', () => {
    it('encode correctly', () => {
      const encoded = new AddressTreeNode(
        Address.from('0x0000000000000000000000000000000000000001'),
        FixedBytes.fromHexString(
          32,
          '0xef583c07cae62e3a002a9ad558064ae80db17162801132f9327e8bb6da16ea8a'
        )
      ).encode()
      expect(encoded.toHexString()).toEqual(
        '0xef583c07cae62e3a002a9ad558064ae80db17162801132f9327e8bb6da16ea8a0000000000000000000000000000000000000000000000000000000000000001'
      )
    })
  })
  describe('getRoot', () => {
    it('return Merkle Root', async () => {
      const tree = new AddressTree([leaf0, leaf1, leaf2, leaf3])
      const root = tree.getRoot()
      expect(root.toHexString()).toStrictEqual(
        '0xd6d9aad1739ab290be3cd14c39e0c731a98cb1463d7002316d8266638687a270'
      )
    })
  })
  describe('getInclusionProof', () => {
    it('return InclusionProof', async () => {
      const tree = new AddressTree([leaf0, leaf1, leaf2, leaf3])
      const inclusionProof0 = tree.getInclusionProof(0)
      const inclusionProof1 = tree.getInclusionProof(1)
      expect(inclusionProof0).toStrictEqual(
        new AddressTreeInclusionProof(
          Address.from('0x0000000000000000000000000000000000000000'),
          0,
          [
            new AddressTreeNode(
              Address.from('0x0000000000000000000000000000000000000001'),
              FixedBytes.fromHexString(
                32,
                '0x99fff0297ffbd7e2f1a6820971ba8fa9d502e2a9259ff15813849b63e09af0c1'
              )
            ),
            new AddressTreeNode(
              Address.from('0x0000000000000000000000000000000000000002'),
              FixedBytes.fromHexString(
                32,
                '0xd4eb911cc17f9330493f225937e9b7c0393c2fdc5541118f3fc22657210a55c2'
              )
            )
          ]
        )
      )
      expect(inclusionProof1).toStrictEqual(
        new AddressTreeInclusionProof(
          Address.from('0x0000000000000000000000000000000000000001'),
          1,
          [
            new AddressTreeNode(
              Address.from('0x0000000000000000000000000000000000000000'),
              FixedBytes.fromHexString(
                32,
                '0xcca51deaf7e2f905f605c563fc14ce3f5314136d90598cf77da785cf016f6a3f'
              )
            ),
            new AddressTreeNode(
              Address.from('0x0000000000000000000000000000000000000002'),
              FixedBytes.fromHexString(
                32,
                '0xd4eb911cc17f9330493f225937e9b7c0393c2fdc5541118f3fc22657210a55c2'
              )
            )
          ]
        )
      )
    })
  })
  describe('verifyInclusion', () => {
    it('return true', async () => {
      const tree = new AddressTreeVerifier()

      const root = FixedBytes.fromHexString(
        32,
        '0xd6d9aad1739ab290be3cd14c39e0c731a98cb1463d7002316d8266638687a270'
      )
      const inclusionProof = new AddressTreeInclusionProof(
        Address.from('0x0000000000000000000000000000000000000000'),
        0,
        [
          new AddressTreeNode(
            Address.from('0x0000000000000000000000000000000000000001'),
            FixedBytes.fromHexString(
              32,
              '0x99fff0297ffbd7e2f1a6820971ba8fa9d502e2a9259ff15813849b63e09af0c1'
            )
          ),
          new AddressTreeNode(
            Address.from('0x0000000000000000000000000000000000000002'),
            FixedBytes.fromHexString(
              32,
              '0xd4eb911cc17f9330493f225937e9b7c0393c2fdc5541118f3fc22657210a55c2'
            )
          )
        ]
      )
      const result = tree.verifyInclusion(
        leaf0,
        leaf1.address,
        leaf1.address,
        root,
        inclusionProof
      )
      expect(result).toBeTruthy()
    })
  })
})
