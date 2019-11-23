import {
  DoubleLayerTree,
  DoubleLayerTreeGenerator,
  DoubleLayerTreeLeaf
} from '../../../src/verifiers/tree'
import { Bytes, Integer, Address } from '../../../src/types'

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
      Bytes.default()
    )
    const leaf1 = new DoubleLayerTreeLeaf(
      token0,
      Integer.from(7),
      Bytes.default()
    )
    const leaf2 = new DoubleLayerTreeLeaf(
      token0,
      Integer.from(15),
      Bytes.default()
    )
    beforeEach(() => {})
    describe('getRoot', () => {
      it('return Merkle Root', async () => {
        const tree = new DoubleLayerTree([leaf0, leaf1, leaf2])
        const root = tree.getRoot()
        expect(root.toHexString()).toStrictEqual(
          '0x616a7f6d29be4734c0fef5c74464d9124c7993361c2a24527223abc3f7ad72bb'
        )
      })
    })
  })
})
