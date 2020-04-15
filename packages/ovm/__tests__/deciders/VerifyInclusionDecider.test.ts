import {
  Address,
  BigNumber,
  Bytes,
  FixedBytes,
  Range
} from '@cryptoeconomicslab/primitives'
import Coder from '@cryptoeconomicslab/eth-coder'
import { VerifyInclusionDecider } from '../../src'
import { MockDeciderManager } from '../mocks/MockDeciderManager'
import { setupContext } from '@cryptoeconomicslab/context'
import {
  DoubleLayerTreeLeaf,
  DoubleLayerInclusionProof,
  IntervalTreeInclusionProof,
  IntervalTreeNode,
  AddressTreeInclusionProof,
  AddressTreeNode,
  DoubleLayerTreeVerifier
} from '@cryptoeconomicslab/merkle-tree'
import { Keccak256 } from '@cryptoeconomicslab/hash'
setupContext({ coder: Coder })

describe('VerifyInclusionDecider', () => {
  const decider = new VerifyInclusionDecider()
  const deciderManager = new MockDeciderManager()
  const tokenAddress = Address.from(
    '0x0000000000000000000000000000000000000000'
  )
  const range = new Range(BigNumber.from(0), BigNumber.from(7))
  const leaf = new DoubleLayerTreeLeaf(
    tokenAddress,
    BigNumber.from(0),
    FixedBytes.from(32, Keccak256.hash(Bytes.fromString('leaf0')).data)
  )
  const inclusionProof = new DoubleLayerInclusionProof(
    new IntervalTreeInclusionProof(BigNumber.from(0), 0, [
      new IntervalTreeNode(
        BigNumber.from(7),
        FixedBytes.fromHexString(
          32,
          '0x036491cc10808eeb0ff717314df6f19ba2e232d04d5f039f6fa382cae41641da'
        )
      ),
      new IntervalTreeNode(
        BigNumber.from(5000),
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
  test('decide true', async () => {
    const root = FixedBytes.fromHexString(
      32,
      '0xd4e96e267ab3f6f1cc39bfcf489e781b5d406c2f776b07364badf188563ffe4e'
    )
    const inputs: Bytes[] = [
      leaf.toStruct(),
      tokenAddress,
      range.toStruct(),
      inclusionProof.toStruct(),
      root
    ].map(ovmContext.coder.encode)
    const decision = await decider.decide(deciderManager, inputs)
    const verifier = new DoubleLayerTreeVerifier()
    const verified = verifier.verifyInclusion(leaf, range, root, inclusionProof)
    console.log(verified)
    expect(decision.outcome).toBeTruthy()
  })

  test('decide false if inputs length does not match', async () => {
    const decision = await decider.decide(deciderManager, [
      Coder.encode(BigNumber.from(1)),
      Coder.encode(BigNumber.from(10))
    ])
    expect(decision.outcome).toBeFalsy()
  })

  test('decide false if inclusionProof is invalid', async () => {
    const root = FixedBytes.fromHexString(
      32,
      '0xd4e96e267ab3f6f1cc39bfcf489e781b5d406c2f776b07364b0000000000fe4e'
    )
    const inputs: Bytes[] = [
      leaf.toStruct(),
      tokenAddress,
      range.toStruct(),
      inclusionProof.toStruct(),
      root
    ].map(ovmContext.coder.encode)
    const decision = await decider.decide(deciderManager, inputs)
    expect(decision.outcome).toBeFalsy()
  })
})
