import { DeciderManager } from '../../src/ovm/DeciderManager'
import {
  AndDecider,
  ForAllSuchThatDecider,
  NotDecider,
  SampleDecider,
  LessThanQuantifier
} from '../../src/ovm/deciders'
import { Property } from '../../src/ovm/types'
import { Address, Bytes, Integer } from '../../src/types/Codables'
import { utils } from 'ethers'
import EthCoder from '../../src/coder/EthCoder'

describe('ForAllSuchThatDecider', () => {
  const SampleDeciderAddress = Address.from(
    '0x0000000000000000000000000000000000000001'
  )
  const NotDeciderAddress = Address.from(
    '0x0000000000000000000000000000000000000002'
  )
  const AndDeciderAddress = Address.from(
    '0x0000000000000000000000000000000000000003'
  )
  const ForAllSuchThatDeciderAddress = Address.from(
    '0x0000000000000000000000000000000000000004'
  )
  const LessThanQuantifierAddress = Address.from(
    '0x0000000000000000000000000000000000000005'
  )
  const trueProperty = Bytes.from(
    utils.arrayify(
      EthCoder.encode(
        new Property(
          SampleDeciderAddress,
          [Bytes.fromString('true')],
          []
        ).toStruct()
      )
    )
  )
  const falseProperty = Bytes.from(
    utils.arrayify(
      EthCoder.encode(new Property(SampleDeciderAddress, [], []).toStruct())
    )
  )
  const deciderManager = new DeciderManager()
  deciderManager.setDecider(SampleDeciderAddress, new SampleDecider())
  deciderManager.setDecider(NotDeciderAddress, new NotDecider(), 'Not')
  deciderManager.setDecider(AndDeciderAddress, new AndDecider(), 'And')
  deciderManager.setDecider(
    ForAllSuchThatDeciderAddress,
    new ForAllSuchThatDecider(),
    'For'
  )
  deciderManager.setQuantifier(
    LessThanQuantifierAddress,
    new LessThanQuantifier()
  )

  it('decide for all n such that n < 10: true', async () => {
    const upperBound = Bytes.from(
      utils.arrayify(EthCoder.encode(Integer.from(10)))
    )
    const quantifier = Bytes.from(
      utils.arrayify(
        EthCoder.encode(
          new Property(LessThanQuantifierAddress, [upperBound], []).toStruct()
        )
      )
    )
    const property = new Property(
      ForAllSuchThatDeciderAddress,
      [Bytes.fromString('n')],
      [quantifier, trueProperty]
    )
    const decision = await deciderManager.decide(property)
    expect(decision.outcome).toEqual(true)
  })
})
