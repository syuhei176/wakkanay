import { AddressTree, AddressTreeNode } from '../../../src/verifiers/tree'
import { Address, Bytes, Integer } from '../../../src/types'

describe('AddressTree', () => {
  const leaf = new AddressTreeNode(Address.default(), Bytes.default())
  beforeEach(() => {})
  describe('getRoot', () => {
    it('return Merkle Root', async () => {
      const tree = new AddressTree([leaf, leaf, leaf])
      const root = tree.getRoot()
      expect(root.toHexString()).toStrictEqual(
        '0x9e974a3dbec582c0ef866260c6fb32e31dc24ef92489edcf1d266dea177765d8'
      )
    })
  })
})
