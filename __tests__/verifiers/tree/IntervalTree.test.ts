import { IntervalTree, IntervalTreeNode } from '../../../src/verifiers/tree'
import { Bytes, Integer } from '../../../src/types'

describe('IntervalTree', () => {
  const leaf0 = new IntervalTreeNode(Integer.from(0), Bytes.default())
  const leaf1 = new IntervalTreeNode(Integer.from(7), Bytes.default())
  const leaf2 = new IntervalTreeNode(Integer.from(15), Bytes.default())
  beforeEach(() => {})
  describe('getRoot', () => {
    it('return Merkle Root', async () => {
      const tree = new IntervalTree([leaf0, leaf1, leaf2])
      const root = tree.getRoot()
      expect(root.toHexString()).toStrictEqual(
        '0x616a7f6d29be4734c0fef5c74464d9124c7993361c2a24527223abc3f7ad72bb'
      )
    })
  })
})
