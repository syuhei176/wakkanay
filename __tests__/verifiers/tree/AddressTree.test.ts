import {
  AddressTree,
  AddressTreeNode,
  AddressTreeVerifier
} from '../../../src/verifiers/tree'
import { Address, Bytes, Integer } from '../../../src/types'
import { Keccak256 } from '../../../src/verifiers/hash/Keccak256'

describe('AddressTree', () => {
  const leaf0 = new AddressTreeNode(
    Address.from('0x0000000000000000000000000000000000000000'),
    Keccak256.hash(Bytes.fromString('root0'))
  )
  const leaf1 = new AddressTreeNode(
    Address.from('0x0000000000000000000000000000000000000001'),
    Keccak256.hash(Bytes.fromString('root1'))
  )
  const leaf2 = new AddressTreeNode(
    Address.from('0x0000000000000000000000000000000000000002'),
    Keccak256.hash(Bytes.fromString('root2'))
  )
  const leaf3 = new AddressTreeNode(
    Address.from('0x0000000000000000000000000000000000000003'),
    Keccak256.hash(Bytes.fromString('root3'))
  )

  beforeEach(() => {})
  describe('getRoot', () => {
    it('return Merkle Root', async () => {
      const tree = new AddressTree([leaf0, leaf1, leaf2, leaf3])
      const root = tree.getRoot()
      expect(root.toHexString()).toStrictEqual(
        '0x30acf9f99796b1b310d05d35854812ff91f43cb3f35c932c0d8053bbae3a661e'
      )
    })
  })
  describe('getInclusionProof', () => {
    it('return InclusionProof', async () => {
      const tree = new AddressTree([leaf0, leaf1, leaf2, leaf3])
      const inclusionProof0 = tree.getInclusionProof(0)
      const inclusionProof1 = tree.getInclusionProof(1)
      expect(inclusionProof0).toStrictEqual({
        leafPosition: 0,
        siblings: [
          new AddressTreeNode(
            Address.from('0x0000000000000000000000000000000000000001'),
            Bytes.fromHexString(
              '0x99fff0297ffbd7e2f1a6820971ba8fa9d502e2a9259ff15813849b63e09af0c1'
            )
          ),
          new AddressTreeNode(
            Address.from('0x0000000000000000000000000000000000000002'),
            Bytes.fromHexString(
              '0x350008941a274700780a1247fa6e7b2db5c34f1bfbcf15e9fb9230f6dd239ca3'
            )
          )
        ]
      })
      expect(inclusionProof1).toStrictEqual({
        leafPosition: 1,
        siblings: [
          new AddressTreeNode(
            Address.from('0x0000000000000000000000000000000000000000'),
            Bytes.fromHexString(
              '0xcca51deaf7e2f905f605c563fc14ce3f5314136d90598cf77da785cf016f6a3f'
            )
          ),
          new AddressTreeNode(
            Address.from('0x0000000000000000000000000000000000000002'),
            Bytes.fromHexString(
              '0x350008941a274700780a1247fa6e7b2db5c34f1bfbcf15e9fb9230f6dd239ca3'
            )
          )
        ]
      })
    })
  })
  describe('verifyInclusion', () => {
    it('return true', async () => {
      const tree = new AddressTreeVerifier()
      const root = Bytes.fromHexString(
        '0x30acf9f99796b1b310d05d35854812ff91f43cb3f35c932c0d8053bbae3a661e'
      )
      const inclusionProof = {
        leafPosition: 0,
        siblings: [
          new AddressTreeNode(
            Address.from('0x0000000000000000000000000000000000000001'),
            Bytes.fromHexString(
              '0x99fff0297ffbd7e2f1a6820971ba8fa9d502e2a9259ff15813849b63e09af0c1'
            )
          ),
          new AddressTreeNode(
            Address.from('0x0000000000000000000000000000000000000002'),
            Bytes.fromHexString(
              '0x350008941a274700780a1247fa6e7b2db5c34f1bfbcf15e9fb9230f6dd239ca3'
            )
          )
        ]
      }
      const result = tree.verifyInclusion(leaf0, root, inclusionProof)
      expect(result).toBeTruthy()
    })
  })
})
