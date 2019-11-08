import { DeciderManager } from '../../src/ovm/DeciderManager'
import {
  AndDecider,
  ForAllSuchThatDecider,
  NotDecider,
  SampleDecider,
  LessThanDecider,
  LessThanQuantifier
} from '../../src/ovm/deciders'
import { Property } from '../../src/ovm/types'
import { Address, Bytes, Integer } from '../../src/types/Codables'
import EthCoder from '../../src/coder/EthCoder'

describe('ForAllsuchThatDecider', () => {
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
  const LessThanDeciderAddress = Address.from(
    '0x0000000000000000000000000000000000000006'
  )
  const trueProperty = EthCoder.encode(
    new Property(SampleDeciderAddress, [Bytes.fromString('true')]).toStruct()
  )
  const falseProperty = EthCoder.encode(
    new Property(SampleDeciderAddress, []).toStruct()
  )
  const upperBound = EthCoder.encode(Integer.from(5))
  const placeholderedProperty = EthCoder.encode(
    new Property(LessThanDeciderAddress, [
      upperBound,
      Bytes.fromString('n')
    ]).toStruct()
  )
  const deciderManager = new DeciderManager()
  deciderManager.setDecider(SampleDeciderAddress, new SampleDecider())
  deciderManager.setDecider(LessThanDeciderAddress, new LessThanDecider())
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
    const upperBound = EthCoder.encode(Integer.from(10))
    const quantifier = EthCoder.encode(
      new Property(LessThanQuantifierAddress, [upperBound]).toStruct()
    )
    const property = new Property(ForAllSuchThatDeciderAddress, [
      quantifier,
      Bytes.fromString('n'),
      trueProperty
    ])
    const decision = await deciderManager.decide(property)
    expect(decision.outcome).toEqual(true)
  })

  it('decide for all n such that n < 10: false', async () => {
    const upperBound = EthCoder.encode(Integer.from(10))
    const quantifier = EthCoder.encode(
      new Property(LessThanQuantifierAddress, [upperBound]).toStruct()
    )
    const property = new Property(ForAllSuchThatDeciderAddress, [
      quantifier,
      Bytes.fromString('n'),
      falseProperty
    ])
    const decision = await deciderManager.decide(property)
    expect(decision.outcome).toEqual(false)
    expect(decision.challenges[0].challengeInput).toEqual(
      EthCoder.encode(Integer.from(0))
    )
    expect(decision.challenges[0].property.deciderAddress).toEqual(
      NotDeciderAddress
    )
  })

  it('decide for all n such that n < 2: n < 5', async () => {
    const upperBound = EthCoder.encode(Integer.from(2))
    const quantifier = EthCoder.encode(
      new Property(LessThanQuantifierAddress, [upperBound]).toStruct()
    )
    const property = new Property(ForAllSuchThatDeciderAddress, [
      quantifier,
      Bytes.fromString('n'),
      placeholderedProperty
    ])
    const decision = await deciderManager.decide(property)
    expect(decision.outcome).toEqual(true)
  })

  it('decide for all n such that n < 10: n < 5', async () => {
    const upperBound = EthCoder.encode(Integer.from(10))
    const quantifier = EthCoder.encode(
      new Property(LessThanQuantifierAddress, [upperBound]).toStruct()
    )
    const property = new Property(ForAllSuchThatDeciderAddress, [
      quantifier,
      Bytes.fromString('n'),
      placeholderedProperty
    ])
    const decision = await deciderManager.decide(property)
    expect(decision.outcome).toEqual(false)
    // challengeInput is 5 because 5 < 5 is false
    expect(decision.challenges[0].challengeInput).toEqual(
      EthCoder.encode(Integer.from(5))
    )
  })
})
